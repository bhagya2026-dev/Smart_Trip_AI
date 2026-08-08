import 'dart:async';
import 'package:flutter/foundation.dart';
import '../domain/models/telemetry.dart';
import '../domain/models/destination.dart';
import '../domain/analytics/safety_eco_scorer.dart';
import '../domain/state_machine/driving_state_processor.dart';
import '../services/fuel_engine.dart';
import '../services/pit_stop_detector.dart';
import '../services/pedometer_engine.dart';
import '../data/sensors/telemetry_simulator.dart';
import '../data/sensors/device_sensor_provider.dart';

enum TravelMode { vehicle, walking }

class TripProvider extends ChangeNotifier {
  // Configs and Core Engines
  VehicleConfig vehicleConfig = defaultVehicleConfig;
  late FuelEngine _fuelEngine;
  late PitStopDetector _pitStopDetector;
  final SafetyEcoScorer _scorer = SafetyEcoScorer();
  final DrivingStateProcessor _stateProcessor = DrivingStateProcessor();
  final DeviceSensorProvider _sensorProvider = DeviceSensorProvider();
  
  // Trip State
  bool isSimulating = false;
  bool isLiveGpsActive = false;
  TravelMode travelMode = TravelMode.vehicle;
  Destination? destination;

  // Real-time metrics
  DrivingState drivingState = DrivingState.offline;
  TelemetryPoint? currentPoint;
  List<TelemetryPoint> telemetryPoints = [];
  List<PitStop> pitStops = [];
  DrivingScore score = DrivingScore(
    safetyScore: 100, ecoScore: 100, overallScore: 100,
    hardAccelerationsCount: 0, hardBrakesCount: 0, sharpSwervesCount: 0,
    idleTimeSeconds: 0, smoothDrivingDistanceKm: 0,
  );
  
  double maxSpeedKmH = 0;
  int activeTripDurationSec = 0;
  double liveIdleCostPerMin = 0;
  double coveredDistanceKm = 0;
  double remainingDistanceKm = 0;

  Timer? _durationTimer;
  int _tripStartTime = 0;

  TripProvider() {
    _fuelEngine = FuelEngine(vehicleConfig);
    _pitStopDetector = PitStopDetector(_fuelEngine);
  }

  void updateVehicleConfig(VehicleConfig newConfig) {
    vehicleConfig = newConfig;
    _fuelEngine.updateConfig(newConfig);
    notifyListeners();
  }

  void setTravelMode(TravelMode mode) {
    travelMode = mode;
    notifyListeners();
  }

  void setDestination(Destination? dest) {
    destination = dest;
    notifyListeners();
  }

  void startSimulation() {
    if (isSimulating || isLiveGpsActive) return;
    
    _resetTripData();
    isSimulating = true;
    
    if (destination != null) {
      telemetrySimulator.setDestination(destination!.latitude, destination!.longitude);
    } else {
      telemetrySimulator.setDestination(null, null);
    }

    telemetrySimulator.start((point) {
      _processNewPoint(point);
    });
    
    _startDurationTimer();
    notifyListeners();
  }

  void stopSimulation() {
    if (!isSimulating) return;
    
    telemetrySimulator.stop();
    isSimulating = false;
    
    _stopDurationTimer();
    drivingState = DrivingState.offline;
    notifyListeners();
  }

  Future<void> toggleLiveGps() async {
    if (isSimulating) stopSimulation();

    if (isLiveGpsActive) {
      _sensorProvider.stopListening();
      isLiveGpsActive = false;
      _stopDurationTimer();
      drivingState = DrivingState.offline;
    } else {
      final hasPermission = await _sensorProvider.requestPermissions();
      if (!hasPermission) return;

      _resetTripData();
      isLiveGpsActive = true;
      final started = await _sensorProvider.startListening((point) {
        _processNewPoint(point);
      });
      if (started) {
        _startDurationTimer();
      } else {
        isLiveGpsActive = false;
      }
    }
    notifyListeners();
  }

  void triggerSimulationEvent(String event) {
    if (isSimulating) {
      telemetrySimulator.triggerManualEvent(event);
    }
  }

  void _resetTripData() {
    telemetryPoints.clear();
    pitStops.clear();
    currentPoint = null;
    drivingState = DrivingState.offline;
    maxSpeedKmH = 0;
    activeTripDurationSec = 0;
    liveIdleCostPerMin = 0;
    coveredDistanceKm = 0;
    remainingDistanceKm = destination?.distanceKmEst ?? 0;
    
    _scorer.reset();
    _stateProcessor.reset();
    _pitStopDetector.reset();
    pedometerEngine.reset();
    
    score = _scorer.getSummary();
    _tripStartTime = DateTime.now().millisecondsSinceEpoch;
  }

  void _startDurationTimer() {
    _durationTimer?.cancel();
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      activeTripDurationSec = ((DateTime.now().millisecondsSinceEpoch - _tripStartTime) / 1000).round();
      notifyListeners();
    });
  }

  void _stopDurationTimer() {
    _durationTimer?.cancel();
    _durationTimer = null;
  }

  void _processNewPoint(TelemetryPoint point) {
    currentPoint = point;
    telemetryPoints.add(point);
    
    if (point.speedKmH > maxSpeedKmH) {
      maxSpeedKmH = point.speedKmH;
    }
    
    // Process State
    drivingState = _stateProcessor.processTelemetry(point);
    
    // Update Score
    final prevPoint = telemetryPoints.length > 1 ? telemetryPoints[telemetryPoints.length - 2] : null;
    _scorer.evaluatePoint(point, prevPoint);
    score = _scorer.getSummary();
    
    // Process Pit Stops
    final pitStop = _pitStopDetector.evaluatePoint(point, drivingState.toString());
    if (pitStop != null) {
      pitStops.add(pitStop);
    }
    
    // Update live metrics
    final activeStop = _pitStopDetector.getActiveStop();
    if (activeStop != null && activeStop.durationSeconds > 15) {
       final waste = _fuelEngine.calculateIdleWaste(activeStop.durationSeconds);
       liveIdleCostPerMin = waste.costPerMinute;
    } else {
       liveIdleCostPerMin = 0;
    }

    coveredDistanceKm = score.smoothDrivingDistanceKm;
    
    notifyListeners();
  }
}
