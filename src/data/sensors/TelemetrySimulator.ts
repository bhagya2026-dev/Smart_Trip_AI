import type { DrivingState, TelemetryPoint } from '../../domain/models/telemetry';

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  baseLat: number;
  baseLng: number;
  targetSpeedKmH: number;
  trafficProbability: number;
}

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    id: 'preset-urban',
    name: 'Sri Lanka Coastal Drive (Galle Road A2)',
    description: 'Real-time Sri Lankan road telemetry with signal holds and speed variance.',
    baseLat: 6.7130,
    baseLng: 79.9026,
    targetSpeedKmH: 45,
    trafficProbability: 0.20,
  },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class TelemetrySimulator {
  private timerId: any = null;
  private isRunning = false;
  private currentPreset: SimulationPreset = SIMULATION_PRESETS[0];
  private callback: ((point: TelemetryPoint) => void) | null = null;

  private stepIndex = 0;
  private lat: number = SIMULATION_PRESETS[0].baseLat;
  private lng: number = SIMULATION_PRESETS[0].baseLng;
  private customStartLat: number | null = null;
  private customStartLng: number | null = null;

  private destLat: number | null = null;
  private destLng: number | null = null;
  private routePath: [number, number][] = [];
  private pathIdx = 0;

  private currentSpeed = 0;
  private tripId = `trip-${Date.now()}`;

  // Manual event overrides
  private pendingEvent: 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | 'TRAFFIC_JAM' | 'PIT_STOP' | null = null;
  private trafficJamTimer = 0;
  private pitStopTimer = 0;

  public setPreset(presetId: string): void {
    const found = SIMULATION_PRESETS.find((p) => p.id === presetId);
    if (found) {
      this.currentPreset = found;
    }
  }

  public setStartPosition(lat: number, lng: number): void {
    this.customStartLat = lat;
    this.customStartLng = lng;
    this.lat = lat;
    this.lng = lng;
  }

  public setDestination(destLat: number | null, destLng: number | null, path: [number, number][] = []): void {
    this.destLat = destLat;
    this.destLng = destLng;
    this.routePath = path;
    this.pathIdx = 0;
  }

  public triggerManualEvent(event: 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | 'TRAFFIC_JAM' | 'PIT_STOP'): void {
    this.pendingEvent = event;
    if (event === 'TRAFFIC_JAM') this.trafficJamTimer = 18;
    if (event === 'PIT_STOP') this.pitStopTimer = 125;
  }

  public start(onPoint: (point: TelemetryPoint) => void): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.callback = onPoint;
    this.stepIndex = 0;
    this.pathIdx = 0;
    this.tripId = `trip-${Date.now()}`;

    if (this.customStartLat !== null && this.customStartLng !== null) {
      this.lat = this.customStartLat;
      this.lng = this.customStartLng;
    } else {
      this.lat = this.currentPreset.baseLat;
      this.lng = this.currentPreset.baseLng;
    }

    this.currentSpeed = 10;
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getTripId(): string {
    return this.tripId;
  }

  private tick(): void {
    if (!this.callback) return;

    this.stepIndex++;
    const now = Date.now();

    // 1. If following a road polyline path, step strictly along the road path!
    if (this.routePath.length > 0) {
      if (this.pathIdx < this.routePath.length) {
        const pt = this.routePath[this.pathIdx];
        this.lat = pt[0];
        this.lng = pt[1];
        this.pathIdx += Math.max(1, Math.floor(this.currentSpeed / 25));

        if (this.pathIdx >= this.routePath.length) {
          // Reached Destination! Stop cleanly.
          const finalPt = this.routePath[this.routePath.length - 1];
          this.lat = finalPt[0];
          this.lng = finalPt[1];
          this.currentSpeed = 0;
          this.emitPoint(now, 0, 9.81, 0, 0, 'OFFLINE');
          this.stop();
          return;
        }
      }
    } else if (this.destLat !== null && this.destLng !== null) {
      // Check distance to destination
      const remainingKm = haversineKm(this.lat, this.lng, this.destLat, this.destLng);
      if (remainingKm <= 0.08) {
        this.lat = this.destLat;
        this.lng = this.destLng;
        this.currentSpeed = 0;
        this.emitPoint(now, 0, 9.81, 0, 0, 'OFFLINE');
        this.stop();
        return;
      }
    }

    // 2. Handle Active Idling / Pit-Stop Timers
    if (this.pitStopTimer > 0) {
      this.pitStopTimer--;
      this.currentSpeed = 0;
      this.emitPoint(now, 0, 9.81, 0, 0, 'PIT_STOP');
      return;
    }

    if (this.trafficJamTimer > 0) {
      this.trafficJamTimer--;
      this.currentSpeed = 0.5;
      this.emitPoint(now, 0.1, 9.81, -0.2, 0, 'IDLING');
      return;
    }

    // 3. Handle One-Shot Manual Events
    if (this.pendingEvent === 'HARD_ACCEL') {
      this.pendingEvent = null;
      this.currentSpeed += 25;
      this.emitPoint(now, 0.5, 9.81, 4.2, 5, 'DRIVING', 'HARD_ACCEL');
      return;
    }

    if (this.pendingEvent === 'HARD_BRAKE') {
      this.pendingEvent = null;
      this.currentSpeed = Math.max(5, this.currentSpeed - 30);
      this.emitPoint(now, -0.8, 9.81, -4.8, -8, 'DRIVING', 'HARD_BRAKE');
      return;
    }

    if (this.pendingEvent === 'SWERVE') {
      this.pendingEvent = null;
      this.emitPoint(now, 2.8, 9.81, 0.4, 54.0, 'DRIVING', 'SWERVE');
      return;
    }

    // 4. Dynamic Speed Control
    const targetSpeed = this.currentPreset.targetSpeedKmH;
    const speedNoise = (Math.random() - 0.5) * 6;
    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.1 + speedNoise;
    this.currentSpeed = Math.max(0, Math.min(120, this.currentSpeed));

    if (this.routePath.length === 0) {
      let dirLat = -0.0003;
      let dirLng = 0.0001;

      if (this.destLat !== null && this.destLng !== null) {
        const dLat = this.destLat - this.lat;
        const dLng = this.destLng - this.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist > 0.0001) {
          const stepSize = (this.currentSpeed / 360000);
          dirLat = (dLat / dist) * stepSize;
          dirLng = (dLng / dist) * stepSize;
        }
      }

      this.lat += dirLat;
      this.lng += dirLng;
    }

    const accelZ = parseFloat(((this.currentSpeed - targetSpeed) * 0.05 + (Math.random() - 0.5) * 0.8).toFixed(2));
    const gyroZ = parseFloat(((Math.random() - 0.5) * 12).toFixed(1));
    const state: DrivingState = this.currentSpeed < 3 ? 'IDLING' : 'DRIVING';

    this.emitPoint(now, 0, 9.81, accelZ, gyroZ, state);
  }

  private emitPoint(
    timestamp: number,
    accelX: number,
    accelY: number,
    accelZ: number,
    gyroZ: number,
    state: DrivingState,
    penalty?: TelemetryPoint['safetyPenalty']
  ): void {
    const point: TelemetryPoint = {
      id: `pt-${this.stepIndex}`,
      tripId: this.tripId,
      timestamp,
      latitude: parseFloat(this.lat.toFixed(6)),
      longitude: parseFloat(this.lng.toFixed(6)),
      speedKmH: parseFloat(this.currentSpeed.toFixed(1)),
      heading: 45,
      accelX,
      accelY,
      accelZ,
      gyroX: 0,
      gyroY: 0,
      gyroZ,
      state,
      gForceCombined: parseFloat((1.0 + Math.abs(accelZ) / 9.81).toFixed(2)),
      safetyPenalty: penalty,
    };

    if (this.callback) {
      this.callback(point);
    }
  }
}

export const telemetrySimulator = new TelemetrySimulator();
