import type { DrivingState, TelemetryPoint } from '../models/telemetry';

export interface StateMachineConfig {
  drivingSpeedThresholdKmH: number; // 5.0 km/h
  idlingSpeedThresholdKmH: number;  // 3.0 km/h
  idlingTimeThresholdSec: number;   // 15 seconds
  pitStopTimeThresholdSec: number;  // 120 seconds (2 mins)
}

export const DEFAULT_STATE_CONFIG: StateMachineConfig = {
  drivingSpeedThresholdKmH: 5.0,
  idlingSpeedThresholdKmH: 3.0,
  idlingTimeThresholdSec: 15,
  pitStopTimeThresholdSec: 120,
};

export class DrivingStateProcessor {
  private config: StateMachineConfig;
  private currentState: DrivingState = 'OFFLINE';
  private stationaryStartTime: number | null = null;

  constructor(config: Partial<StateMachineConfig> = {}) {
    this.config = { ...DEFAULT_STATE_CONFIG, ...config };
  }

  public getCurrentState(): DrivingState {
    return this.currentState;
  }

  public processTelemetry(point: TelemetryPoint): DrivingState {
    const speed = point.speedKmH;
    const now = point.timestamp;

    if (speed >= this.config.drivingSpeedThresholdKmH) {
      // Vehicle is moving fast enough -> DRIVING state
      this.stationaryStartTime = null;
      this.currentState = 'DRIVING';
      return this.currentState;
    }

    if (speed < this.config.idlingSpeedThresholdKmH) {
      // Vehicle speed is low
      if (this.stationaryStartTime === null) {
        this.stationaryStartTime = now;
      }

      const stationaryDurationSec = (now - this.stationaryStartTime) / 1000;

      if (stationaryDurationSec >= this.config.pitStopTimeThresholdSec) {
        // Stationary for > 2 mins -> PIT_STOP
        this.currentState = 'PIT_STOP';
      } else if (stationaryDurationSec >= this.config.idlingTimeThresholdSec) {
        // Stationary for > 15s -> IDLING
        this.currentState = 'IDLING';
      } else {
        // Transitional state, keep previous state unless offline
        if (this.currentState === 'OFFLINE') {
          this.currentState = 'IDLING';
        }
      }
      return this.currentState;
    }

    // Intermediate speed (between 3km/h and 5km/h)
    return this.currentState === 'OFFLINE' ? 'DRIVING' : this.currentState;
  }

  public reset(): void {
    this.currentState = 'OFFLINE';
    this.stationaryStartTime = null;
  }
}
