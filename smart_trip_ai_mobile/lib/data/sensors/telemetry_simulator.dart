import 'dart:async';
import 'dart:math';
import '../../domain/models/telemetry.dart';

class SimulationPreset {
  final String id;
  final String name;
  final String description;
  final double baseLat;
  final double baseLng;
  final double targetSpeedKmH;
  final double trafficProbability;

  const SimulationPreset({
    required this.id,
    required this.name,
    required this.description,
    required this.baseLat,
    required this.baseLng,
    required this.targetSpeedKmH,
    required this.trafficProbability,
  });
}

const List<SimulationPreset> simulationPresets = [
  SimulationPreset(
    id: 'preset-urban',
    name: 'Sri Lanka Coastal Drive (Galle Road A2)',
    description: 'Real-time Sri Lankan road telemetry with signal holds and speed variance.',
    baseLat: 6.7130,
    baseLng: 79.9026,
    targetSpeedKmH: 45,
    trafficProbability: 0.20,
  ),
];

double _haversineKm(double lat1, double lon1, double lat2, double lon2) {
  const r = 6371.0;
  final dLat = ((lat2 - lat1) * pi) / 180;
  final dLon = ((lon2 - lon1) * pi) / 180;
  final a = sin(dLat / 2) * sin(dLat / 2) +
      cos((lat1 * pi) / 180) *
          cos((lat2 * pi) / 180) *
          sin(dLon / 2) *
          sin(dLon / 2);
  final c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return r * c;
}

class TelemetrySimulator {
  Timer? _timer;
  bool isRunning = false;
  SimulationPreset currentPreset = simulationPresets[0];
  Function(TelemetryPoint)? callback;

  int stepIndex = 0;
  double lat = simulationPresets[0].baseLat;
  double lng = simulationPresets[0].baseLng;
  double? customStartLat;
  double? customStartLng;

  double? destLat;
  double? destLng;
  List<List<double>> routePath = [];
  int pathIdx = 0;

  double currentSpeed = 0;
  String tripId = 'trip-${DateTime.now().millisecondsSinceEpoch}';

  String? pendingEvent;
  int trafficJamTimer = 0;
  int pitStopTimer = 0;
  final _random = Random();

  void setPreset(String presetId) {
    try {
      currentPreset = simulationPresets.firstWhere((p) => p.id == presetId);
    } catch (_) {}
  }

  void setStartPosition(double newLat, double newLng) {
    customStartLat = newLat;
    customStartLng = newLng;
    lat = newLat;
    lng = newLng;
  }

  void setDestination(double? dLat, double? dLng, [List<List<double>> path = const []]) {
    destLat = dLat;
    destLng = dLng;
    routePath = path;
    pathIdx = 0;
  }

  void triggerManualEvent(String event) {
    pendingEvent = event;
    if (event == 'TRAFFIC_JAM') trafficJamTimer = 18;
    if (event == 'PIT_STOP') pitStopTimer = 125;
  }

  void start(Function(TelemetryPoint) onPoint) {
    if (isRunning) return;
    isRunning = true;
    callback = onPoint;
    stepIndex = 0;
    pathIdx = 0;
    tripId = 'trip-${DateTime.now().millisecondsSinceEpoch}';

    if (customStartLat != null && customStartLng != null) {
      lat = customStartLat!;
      lng = customStartLng!;
    } else {
      lat = currentPreset.baseLat;
      lng = currentPreset.baseLng;
    }

    currentSpeed = 10;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    isRunning = false;
  }

  bool isActive() => isRunning;
  String getTripId() => tripId;

  void _tick() {
    if (callback == null) return;

    stepIndex++;
    final now = DateTime.now().millisecondsSinceEpoch;

    // 1. If following a road polyline path, step strictly along the road path!
    if (routePath.isNotEmpty) {
      if (pathIdx < routePath.length) {
        final pt = routePath[pathIdx];
        lat = pt[0];
        lng = pt[1];
        pathIdx += max(1, (currentSpeed / 25).floor());

        if (pathIdx >= routePath.length) {
          // Reached Destination! Stop cleanly.
          final finalPt = routePath.last;
          lat = finalPt[0];
          lng = finalPt[1];
          currentSpeed = 0;
          _emitPoint(now, 0, 9.81, 0, 0, DrivingState.offline);
          stop();
          return;
        }
      }
    } else if (destLat != null && destLng != null) {
      // Check distance to destination
      final remainingKm = _haversineKm(lat, lng, destLat!, destLng!);
      if (remainingKm <= 0.08) {
        lat = destLat!;
        lng = destLng!;
        currentSpeed = 0;
        _emitPoint(now, 0, 9.81, 0, 0, DrivingState.offline);
        stop();
        return;
      }
    }

    // 2. Handle Active Idling / Pit-Stop Timers
    if (pitStopTimer > 0) {
      pitStopTimer--;
      currentSpeed = 0;
      _emitPoint(now, 0, 9.81, 0, 0, DrivingState.pitStop);
      return;
    }

    if (trafficJamTimer > 0) {
      trafficJamTimer--;
      currentSpeed = 0.5;
      _emitPoint(now, 0.1, 9.81, -0.2, 0, DrivingState.idling);
      return;
    }

    // 3. Handle One-Shot Manual Events
    if (pendingEvent == 'HARD_ACCEL') {
      pendingEvent = null;
      currentSpeed += 25;
      _emitPoint(now, 0.5, 9.81, 4.2, 5, DrivingState.driving, 'HARD_ACCEL');
      return;
    }

    if (pendingEvent == 'HARD_BRAKE') {
      pendingEvent = null;
      currentSpeed = max(5, currentSpeed - 30);
      _emitPoint(now, -0.8, 9.81, -4.8, -8, DrivingState.driving, 'HARD_BRAKE');
      return;
    }

    if (pendingEvent == 'SWERVE') {
      pendingEvent = null;
      _emitPoint(now, 2.8, 9.81, 0.4, 54.0, DrivingState.driving, 'SWERVE');
      return;
    }

    // 4. Dynamic Speed Control
    final targetSpeed = currentPreset.targetSpeedKmH;
    final speedNoise = (_random.nextDouble() - 0.5) * 6;
    currentSpeed += (targetSpeed - currentSpeed) * 0.1 + speedNoise;
    currentSpeed = max(0, min(120, currentSpeed));

    if (routePath.isEmpty) {
      double dirLat = -0.0003;
      double dirLng = 0.0001;

      if (destLat != null && destLng != null) {
        final dLat = destLat! - lat;
        final dLng = destLng! - lng;
        final dist = sqrt(dLat * dLat + dLng * dLng);

        if (dist > 0.0001) {
          final stepSize = (currentSpeed / 360000);
          dirLat = (dLat / dist) * stepSize;
          dirLng = (dLng / dist) * stepSize;
        }
      }

      lat += dirLat;
      lng += dirLng;
    }

    final accelZValue = (currentSpeed - targetSpeed) * 0.05 + (_random.nextDouble() - 0.5) * 0.8;
    final accelZ = double.parse(accelZValue.toStringAsFixed(2));
    final gyroZValue = (_random.nextDouble() - 0.5) * 12;
    final gyroZ = double.parse(gyroZValue.toStringAsFixed(1));
    final state = currentSpeed < 3 ? DrivingState.idling : DrivingState.driving;

    _emitPoint(now, 0, 9.81, accelZ, gyroZ, state);
  }

  void _emitPoint(
    int timestamp,
    double accelX,
    double accelY,
    double accelZ,
    double gyroZ,
    DrivingState state,
    [String? penalty]
  ) {
    final point = TelemetryPoint(
      id: 'pt-$stepIndex',
      tripId: tripId,
      timestamp: timestamp,
      latitude: double.parse(lat.toStringAsFixed(6)),
      longitude: double.parse(lng.toStringAsFixed(6)),
      speedKmH: double.parse(currentSpeed.toStringAsFixed(1)),
      heading: 45,
      accelX: accelX,
      accelY: accelY,
      accelZ: accelZ,
      gyroX: 0,
      gyroY: 0,
      gyroZ: gyroZ,
      state: state,
      gForceCombined: double.parse((1.0 + accelZ.abs() / 9.81).toStringAsFixed(2)),
      safetyPenalty: penalty,
    );

    if (callback != null) {
      callback!(point);
    }
  }
}

final telemetrySimulator = TelemetrySimulator();
