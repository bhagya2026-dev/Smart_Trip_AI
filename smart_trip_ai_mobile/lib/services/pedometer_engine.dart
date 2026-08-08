import 'dart:math';

class PedometerResult {
  final int stepsCount;
  final double caloriesBurned;
  final bool stepDetected;

  PedometerResult({
    required this.stepsCount,
    required this.caloriesBurned,
    required this.stepDetected,
  });
}

class PedometerSummary {
  final int stepsCount;
  final double caloriesBurned;

  PedometerSummary({
    required this.stepsCount,
    required this.caloriesBurned,
  });
}

/// Real-time Physical Device Pedometer & Step Detection Engine.
/// Uses DeviceMotionEvent (Accelerometer peak detection algorithm) to count actual physical footsteps.
class PedometerEngine {
  int stepsCount = 0;
  double caloriesBurned = 0;
  int lastStepTimestamp = 0;
  double lastAccelMag = 9.81;
  final double stepThreshold = 11.2; // Vertical acceleration step impact threshold (m/s²)
  final int stepRefractoryMs = 350; // Minimum time between human footsteps (ms)

  void reset() {
    stepsCount = 0;
    caloriesBurned = 0;
    lastStepTimestamp = 0;
    lastAccelMag = 9.81;
  }

  /// Process 3-axis accelerometer vector from phone's hardware motion sensor
  PedometerResult processMotion(double accelX, double accelY, double accelZ) {
    final now = DateTime.now().millisecondsSinceEpoch;
    // Combined 3D acceleration magnitude (m/s²)
    final mag = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);

    bool stepDetected = false;

    // Peak detection: Transition from low acceleration to impact peak above threshold
    if (mag > stepThreshold &&
        lastAccelMag <= stepThreshold &&
        (now - lastStepTimestamp) > stepRefractoryMs) {
      stepsCount += 1;
      // Approx 0.045 kcal per footstep
      caloriesBurned = double.parse((stepsCount * 0.045).toStringAsFixed(1));
      lastStepTimestamp = now;
      stepDetected = true;
    }

    lastAccelMag = mag;

    return PedometerResult(
      stepsCount: stepsCount,
      caloriesBurned: caloriesBurned,
      stepDetected: stepDetected,
    );
  }

  /// Fallback step estimation from real-time GPS distance when motion sensors are disabled
  PedometerSummary updateFromGpsDistance(double distanceKm) {
    final estimatedSteps = (distanceKm * 1310).round(); // ~1310 steps / km avg stride
    if (estimatedSteps > stepsCount) {
      stepsCount = estimatedSteps;
      caloriesBurned = double.parse((stepsCount * 0.045).toStringAsFixed(1));
    }
    return PedometerSummary(
      stepsCount: stepsCount,
      caloriesBurned: caloriesBurned,
    );
  }

  PedometerSummary getSummary() {
    return PedometerSummary(
      stepsCount: stepsCount,
      caloriesBurned: caloriesBurned,
    );
  }
}

final pedometerEngine = PedometerEngine();
