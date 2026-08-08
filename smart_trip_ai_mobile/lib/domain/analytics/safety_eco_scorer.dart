import 'dart:math';
import '../models/telemetry.dart';

class ScoreThresholds {
  final double hardAccelThreshold;
  final double hardBrakeThreshold;
  final double sharpSwerveThresholdDeg;
  final int hardAccelPenalty;
  final int hardBrakePenalty;
  final int sharpSwervePenalty;
  final int idleMinutePenalty;
  final double smoothKmRecovery;

  const ScoreThresholds({
    this.hardAccelThreshold = 3.5,
    this.hardBrakeThreshold = -4.0,
    this.sharpSwerveThresholdDeg = 45.0,
    this.hardAccelPenalty = 4,
    this.hardBrakePenalty = 6,
    this.sharpSwervePenalty = 5,
    this.idleMinutePenalty = 2,
    this.smoothKmRecovery = 1.5,
  });
}

class SafetyEcoScorerResult {
  final String? penaltyType;
  final double safetyScore;
  final double ecoScore;

  SafetyEcoScorerResult({
    this.penaltyType,
    required this.safetyScore,
    required this.ecoScore,
  });
}

class SafetyEcoScorer {
  final ScoreThresholds thresholds;
  int hardAccelCount = 0;
  int hardBrakeCount = 0;
  int sharpSwerveCount = 0;
  double idleTimeSeconds = 0;
  double totalDistanceKm = 0;
  double smoothDistanceKm = 0;

  SafetyEcoScorer({this.thresholds = const ScoreThresholds()});

  SafetyEcoScorerResult evaluatePoint(TelemetryPoint point, [TelemetryPoint? previousPoint]) {
    String? penaltyType;

    // Check Longitudinal Acceleration (accelZ)
    final accelZ = point.accelZ;
    if (accelZ > thresholds.hardAccelThreshold) {
      hardAccelCount++;
      penaltyType = 'HARD_ACCEL';
    } else if (accelZ < thresholds.hardBrakeThreshold) {
      hardBrakeCount++;
      penaltyType = 'HARD_BRAKE';
    }

    // Check Yaw Turn Rate (gyroZ in deg/s)
    final yawRate = point.gyroZ.abs();
    if (yawRate > thresholds.sharpSwerveThresholdDeg && penaltyType == null) {
      sharpSwerveCount++;
      penaltyType = 'SWERVE';
    }

    // Calculate distance delta if previous point exists
    if (previousPoint != null) {
      final dtHours = (point.timestamp - previousPoint.timestamp) / (1000 * 3600);
      final avgSpeed = (point.speedKmH + previousPoint.speedKmH) / 2;
      final dKm = avgSpeed * dtHours;

      if (dKm > 0 && dKm < 5) {
        totalDistanceKm += dKm;
        if (penaltyType == null && point.state == DrivingState.driving) {
          smoothDistanceKm += dKm;
        }
      }
    }

    // Track Idling duration
    if (point.state == DrivingState.idling && previousPoint != null) {
      final dtSec = (point.timestamp - previousPoint.timestamp) / 1000;
      if (dtSec > 0 && dtSec < 60) {
        idleTimeSeconds += dtSec;
      }
    }

    final scores = calculateScores();

    return SafetyEcoScorerResult(
      penaltyType: penaltyType,
      safetyScore: scores.safetyScore,
      ecoScore: scores.ecoScore,
    );
  }

  DrivingScore calculateScores() {
    // Base Safety Score calculation: starting at 100
    double safetyDeductions = (hardAccelCount * thresholds.hardAccelPenalty) +
        (hardBrakeCount * thresholds.hardBrakePenalty) +
        (sharpSwerveCount * thresholds.sharpSwervePenalty).toDouble();

    double recoveryBonus = smoothDistanceKm * thresholds.smoothKmRecovery;
    double safetyScore = max(0, min(100, (100 - safetyDeductions + recoveryBonus).roundToDouble()));

    // Eco Score calculation: starting at 100, penalized by hard accels, hard brakes, and idling
    double idleMinutes = idleTimeSeconds / 60;
    double ecoDeductions = (hardAccelCount * (thresholds.hardAccelPenalty * 1.2)) +
        (hardBrakeCount * (thresholds.hardBrakePenalty * 0.8)) +
        (idleMinutes * thresholds.idleMinutePenalty);

    double ecoScore = max(0, min(100, (100 - ecoDeductions + recoveryBonus * 0.8).roundToDouble()));

    double overallScore = (safetyScore * 0.6 + ecoScore * 0.4).roundToDouble();

    return DrivingScore(
      safetyScore: safetyScore,
      ecoScore: ecoScore,
      overallScore: overallScore,
      hardAccelerationsCount: hardAccelCount,
      hardBrakesCount: hardBrakeCount,
      sharpSwervesCount: sharpSwerveCount,
      idleTimeSeconds: idleTimeSeconds.round(),
      smoothDrivingDistanceKm: double.parse(smoothDistanceKm.toStringAsFixed(2)),
    );
  }

  DrivingScore getSummary() {
    return calculateScores();
  }

  void reset() {
    hardAccelCount = 0;
    hardBrakeCount = 0;
    sharpSwerveCount = 0;
    idleTimeSeconds = 0;
    totalDistanceKm = 0;
    smoothDistanceKm = 0;
  }
}
