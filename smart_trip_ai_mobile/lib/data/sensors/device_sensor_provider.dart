import 'dart:async';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:geolocator/geolocator.dart';
import '../../domain/models/telemetry.dart';
import '../../services/pedometer_engine.dart';

class DeviceSensorProvider {
  StreamSubscription<Position>? _positionStream;
  StreamSubscription<UserAccelerometerEvent>? _accelStream;
  StreamSubscription<GyroscopeEvent>? _gyroStream;
  
  bool isMotionActive = false;
  Function(TelemetryPoint)? callback;
  
  double lastAccelX = 0;
  double lastAccelY = 9.81;
  double lastAccelZ = 0;
  double lastGyroZ = 0;

  Future<bool> requestPermissions() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return false;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return false;
      }
      return true;
    } catch (e) {
      print('Sensor permission error: $e');
      return false;
    }
  }

  Future<bool> startListening(Function(TelemetryPoint) onPoint) async {
    callback = onPoint;

    // 1. Device Motion Listener (Hardware Accelerometer Peak Pedometer & Gyroscope)
    try {
      _accelStream = userAccelerometerEventStream().listen((UserAccelerometerEvent event) {
        lastAccelX = double.parse(event.x.toStringAsFixed(2));
        lastAccelY = double.parse((event.y + 9.81).toStringAsFixed(2)); // adding approx gravity
        lastAccelZ = double.parse(event.z.toStringAsFixed(2));
        pedometerEngine.processMotion(lastAccelX, lastAccelY, lastAccelZ);
      });
      _gyroStream = gyroscopeEventStream().listen((GyroscopeEvent event) {
        lastGyroZ = double.parse(event.z.toStringAsFixed(1));
      });
      isMotionActive = true;
    } catch (e) {
      print('Sensors error: $e');
    }

    // 2. Geolocation Listener (GPS Speed & Coordinates)
    try {
      _positionStream = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 0,
        ),
      ).listen(_handlePosition);
      return true;
    } catch (e) {
      print('Geolocator error: $e');
    }

    return false;
  }

  void _handlePosition(Position pos) {
    if (callback == null) return;

    final speedMps = pos.speed;
    final speedKmH = double.parse((speedMps * 3.6).toStringAsFixed(1));

    callback!(TelemetryPoint(
      id: 'pt-${DateTime.now().millisecondsSinceEpoch}',
      tripId: 'real-trip',
      timestamp: pos.timestamp?.millisecondsSinceEpoch ?? DateTime.now().millisecondsSinceEpoch,
      latitude: pos.latitude,
      longitude: pos.longitude,
      altitude: pos.altitude,
      speedKmH: speedKmH,
      heading: pos.heading,
      accuracy: pos.accuracy,
      accelX: lastAccelX,
      accelY: lastAccelY,
      accelZ: lastAccelZ,
      gyroX: 0,
      gyroY: 0,
      gyroZ: lastGyroZ,
      state: speedKmH > 3 ? DrivingState.driving : DrivingState.idling, // Simplified state derivation for raw sensors
      gForceCombined: double.parse((1.0 + (lastAccelZ.abs()) / 9.81).toStringAsFixed(2)),
    ));
  }

  void stopListening() {
    _accelStream?.cancel();
    _accelStream = null;
    
    _gyroStream?.cancel();
    _gyroStream = null;
    
    isMotionActive = false;

    _positionStream?.cancel();
    _positionStream = null;

    callback = null;
  }
}
