/**
 * Real-time Physical Device Pedometer & Step Detection Engine.
 * Uses DeviceMotionEvent (Accelerometer peak detection algorithm) to count actual physical footsteps.
 */

export class PedometerEngine {
  private stepsCount: number = 0;
  private caloriesBurned: number = 0;
  private lastStepTimestamp: number = 0;
  private lastAccelMag: number = 9.81;
  private stepThreshold: number = 11.2; // Vertical acceleration step impact threshold (m/s²)
  private stepRefractoryMs: number = 350; // Minimum time between human footsteps (ms)

  public reset(): void {
    this.stepsCount = 0;
    this.caloriesBurned = 0;
    this.lastStepTimestamp = 0;
    this.lastAccelMag = 9.81;
  }

  /**
   * Process 3-axis accelerometer vector from phone's hardware motion sensor
   */
  public processMotion(accelX: number, accelY: number, accelZ: number): {
    stepsCount: number;
    caloriesBurned: number;
    stepDetected: boolean;
  } {
    const now = Date.now();
    // Combined 3D acceleration magnitude (m/s²)
    const mag = Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);

    let stepDetected = false;

    // Peak detection: Transition from low acceleration to impact peak above threshold
    if (
      mag > this.stepThreshold &&
      this.lastAccelMag <= this.stepThreshold &&
      now - this.lastStepTimestamp > this.stepRefractoryMs
    ) {
      this.stepsCount += 1;
      // Approx 0.045 kcal per footstep
      this.caloriesBurned = parseFloat((this.stepsCount * 0.045).toFixed(1));
      this.lastStepTimestamp = now;
      stepDetected = true;
    }

    this.lastAccelMag = mag;

    return {
      stepsCount: this.stepsCount,
      caloriesBurned: this.caloriesBurned,
      stepDetected,
    };
  }

  /**
   * Fallback step estimation from real-time GPS distance when motion sensors are disabled
   */
  public updateFromGpsDistance(distanceKm: number): {
    stepsCount: number;
    caloriesBurned: number;
  } {
    const estimatedSteps = Math.round(distanceKm * 1310); // ~1310 steps / km avg stride
    if (estimatedSteps > this.stepsCount) {
      this.stepsCount = estimatedSteps;
      this.caloriesBurned = parseFloat((this.stepsCount * 0.045).toFixed(1));
    }
    return {
      stepsCount: this.stepsCount,
      caloriesBurned: this.caloriesBurned,
    };
  }

  public getSummary(): { stepsCount: number; caloriesBurned: number } {
    return {
      stepsCount: this.stepsCount,
      caloriesBurned: this.caloriesBurned,
    };
  }
}

export const pedometerEngine = new PedometerEngine();
