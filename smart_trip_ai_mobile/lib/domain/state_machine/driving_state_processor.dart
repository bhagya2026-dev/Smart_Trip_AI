import '../models/telemetry.dart';

class StateMachineConfig {
  final double drivingSpeedThresholdKmH;
  final double idlingSpeedThresholdKmH;
  final double idlingTimeThresholdSec;
  final double pitStopTimeThresholdSec;

  const StateMachineConfig({
    this.drivingSpeedThresholdKmH = 5.0,
    this.idlingSpeedThresholdKmH = 3.0,
    this.idlingTimeThresholdSec = 15.0,
    this.pitStopTimeThresholdSec = 120.0,
  });
}

class DrivingStateProcessor {
  final StateMachineConfig config;
  DrivingState currentState = DrivingState.offline;
  int? stationaryStartTime;

  DrivingStateProcessor({this.config = const StateMachineConfig()});

  DrivingState getCurrentState() {
    return currentState;
  }

  DrivingState processTelemetry(TelemetryPoint point) {
    final speed = point.speedKmH;
    final now = point.timestamp;

    if (speed >= config.drivingSpeedThresholdKmH) {
      // Vehicle is moving fast enough -> DRIVING state
      stationaryStartTime = null;
      currentState = DrivingState.driving;
      return currentState;
    }

    if (speed < config.idlingSpeedThresholdKmH) {
      // Vehicle speed is low
      stationaryStartTime ??= now;

      final stationaryDurationSec = (now - stationaryStartTime!) / 1000;

      if (stationaryDurationSec >= config.pitStopTimeThresholdSec) {
        // Stationary for > 2 mins -> PIT_STOP
        currentState = DrivingState.pitStop;
      } else if (stationaryDurationSec >= config.idlingTimeThresholdSec) {
        // Stationary for > 15s -> IDLING
        currentState = DrivingState.idling;
      } else {
        // Transitional state, keep previous state unless offline
        if (currentState == DrivingState.offline) {
          currentState = DrivingState.idling;
        }
      }
      return currentState;
    }

    // Intermediate speed (between 3km/h and 5km/h)
    return currentState == DrivingState.offline ? DrivingState.driving : currentState;
  }

  void reset() {
    currentState = DrivingState.offline;
    stationaryStartTime = null;
  }
}
