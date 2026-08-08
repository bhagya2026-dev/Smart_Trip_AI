import type { DrivingScore, TelemetryPoint } from '../models/telemetry';

export interface ScoreThresholds {
  hardAccelThreshold: number; // 3.5 m/s^2
  hardBrakeThreshold: number; // -4.0 m/s^2
  sharpSwerveThresholdDeg: number; // 45.0 deg/s yaw rate
  hardAccelPenalty: number; // 4 points deduction
  hardBrakePenalty: number; // 6 points deduction
  sharpSwervePenalty: number; // 5 points deduction
  idleMinutePenalty: number; // 2 points per idle min
  smoothKmRecovery: number; // +1 point score recovery per smooth km driven
}

export const DEFAULT_SCORE_THRESHOLDS: ScoreThresholds = {
  hardAccelThreshold: 3.5,
  hardBrakeThreshold: -4.0,
  sharpSwerveThresholdDeg: 45.0,
  hardAccelPenalty: 4,
  hardBrakePenalty: 6,
  sharpSwervePenalty: 5,
  idleMinutePenalty: 2,
  smoothKmRecovery: 1.5,
};

export class SafetyEcoScorer {
  private thresholds: ScoreThresholds;
  private hardAccelCount: number = 0;
  private hardBrakeCount: number = 0;
  private sharpSwerveCount: number = 0;
  private idleTimeSeconds: number = 0;
  private totalDistanceKm: number = 0;
  private smoothDistanceKm: number = 0;

  constructor(thresholds: Partial<ScoreThresholds> = {}) {
    this.thresholds = { ...DEFAULT_SCORE_THRESHOLDS, ...thresholds };
  }

  public evaluatePoint(
    point: TelemetryPoint,
    previousPoint?: TelemetryPoint
  ): {
    penaltyType: 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | null;
    safetyScore: number;
    ecoScore: number;
  } {
    let penaltyType: 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | null = null;

    // Check Longitudinal Acceleration (accelZ)
    // Note: Forward accel > 3.5 m/s^2, Hard Brake < -4.0 m/s^2
    const accelZ = point.accelZ;
    if (accelZ > this.thresholds.hardAccelThreshold) {
      this.hardAccelCount++;
      penaltyType = 'HARD_ACCEL';
    } else if (accelZ < this.thresholds.hardBrakeThreshold) {
      this.hardBrakeCount++;
      penaltyType = 'HARD_BRAKE';
    }

    // Check Yaw Turn Rate (gyroZ in deg/s)
    const yawRate = Math.abs(point.gyroZ);
    if (yawRate > this.thresholds.sharpSwerveThresholdDeg && !penaltyType) {
      this.sharpSwerveCount++;
      penaltyType = 'SWERVE';
    }

    // Calculate distance delta if previous point exists
    if (previousPoint) {
      const dtHours = (point.timestamp - previousPoint.timestamp) / (1000 * 3600);
      const avgSpeed = (point.speedKmH + previousPoint.speedKmH) / 2;
      const dKm = avgSpeed * dtHours;

      if (dKm > 0 && dKm < 5) {
        this.totalDistanceKm += dKm;
        if (!penaltyType && point.state === 'DRIVING') {
          this.smoothDistanceKm += dKm;
        }
      }
    }

    // Track Idling duration
    if (point.state === 'IDLING' && previousPoint) {
      const dtSec = (point.timestamp - previousPoint.timestamp) / 1000;
      if (dtSec > 0 && dtSec < 60) {
        this.idleTimeSeconds += dtSec;
      }
    }

    const { safetyScore, ecoScore } = this.calculateScores();

    return {
      penaltyType,
      safetyScore,
      ecoScore,
    };
  }

  public calculateScores(): { safetyScore: number; ecoScore: number; overallScore: number } {
    // Base Safety Score calculation: starting at 100
    let safetyDeductions =
      this.hardAccelCount * this.thresholds.hardAccelPenalty +
      this.hardBrakeCount * this.thresholds.hardBrakePenalty +
      this.sharpSwerveCount * this.thresholds.sharpSwervePenalty;

    const recoveryBonus = this.smoothDistanceKm * this.thresholds.smoothKmRecovery;
    let safetyScore = Math.max(0, Math.min(100, Math.round(100 - safetyDeductions + recoveryBonus)));

    // Eco Score calculation: starting at 100, penalized by hard accels, hard brakes, and idling
    const idleMinutes = this.idleTimeSeconds / 60;
    let ecoDeductions =
      this.hardAccelCount * (this.thresholds.hardAccelPenalty * 1.2) +
      this.hardBrakeCount * (this.thresholds.hardBrakePenalty * 0.8) +
      idleMinutes * this.thresholds.idleMinutePenalty;

    let ecoScore = Math.max(0, Math.min(100, Math.round(100 - ecoDeductions + recoveryBonus * 0.8)));

    const overallScore = Math.round(safetyScore * 0.6 + ecoScore * 0.4);

    return { safetyScore, ecoScore, overallScore };
  }

  public getSummary(): DrivingScore {
    const { safetyScore, ecoScore, overallScore } = this.calculateScores();
    return {
      safetyScore,
      ecoScore,
      overallScore,
      hardAccelerationsCount: this.hardAccelCount,
      hardBrakesCount: this.hardBrakeCount,
      sharpSwervesCount: this.sharpSwerveCount,
      idleTimeSeconds: Math.round(this.idleTimeSeconds),
      smoothDrivingDistanceKm: parseFloat(this.smoothDistanceKm.toFixed(2)),
    };
  }

  public reset(): void {
    this.hardAccelCount = 0;
    this.hardBrakeCount = 0;
    this.sharpSwerveCount = 0;
    this.idleTimeSeconds = 0;
    this.totalDistanceKm = 0;
    this.smoothDistanceKm = 0;
  }
}
