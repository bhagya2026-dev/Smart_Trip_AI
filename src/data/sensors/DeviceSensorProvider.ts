import type { TelemetryPoint } from '../../domain/models/telemetry';
import { pedometerEngine } from '../../services/pedometerEngine';

export class DeviceSensorProvider {
  private watchId: number | null = null;
  private isMotionActive = false;
  private callback: ((point: Partial<TelemetryPoint>) => void) | null = null;
  
  private lastAccelX = 0;
  private lastAccelY = 9.81;
  private lastAccelZ = 0;
  private lastGyroZ = 0;

  public async requestPermissions(): Promise<boolean> {
    try {
      // iOS DeviceMotionEvent permission check
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          console.warn('DeviceMotion permission denied by user');
          return false;
        }
      }

      return true;
    } catch (e) {
      console.warn('Sensor permission error:', e);
      return false;
    }
  }

  public startListening(onPoint: (point: Partial<TelemetryPoint>) => void): boolean {
    this.callback = onPoint;

    // 1. Device Motion Listener (Hardware Accelerometer Peak Pedometer & Gyroscope)
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion, true);
      this.isMotionActive = true;
    }

    // 2. Geolocation Listener (GPS Speed & Coordinates)
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePosition,
        (err) => console.warn('Geolocation error:', err.message),
        {
          enableHighAccuracy: true,
          maximumAge: 500,
          timeout: 5000,
        }
      );
      return true;
    }

    return false;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    const rot = event.rotationRate;

    if (acc) {
      this.lastAccelX = parseFloat((acc.x || 0).toFixed(2));
      this.lastAccelY = parseFloat((acc.y || 9.81).toFixed(2));
      this.lastAccelZ = parseFloat((acc.z || 0).toFixed(2));

      // Feed motion vector into real-time pedometer engine
      pedometerEngine.processMotion(this.lastAccelX, this.lastAccelY, this.lastAccelZ);
    }

    if (rot) {
      this.lastGyroZ = parseFloat((rot.gamma || rot.alpha || 0).toFixed(1));
    }
  };

  private handlePosition = (pos: GeolocationPosition) => {
    if (!this.callback) return;

    const speedMps = pos.coords.speed || 0;
    const speedKmH = parseFloat((speedMps * 3.6).toFixed(1));

    this.callback({
      timestamp: pos.timestamp || Date.now(),
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      altitude: pos.coords.altitude || 0,
      speedKmH,
      heading: pos.coords.heading || 0,
      accuracy: pos.coords.accuracy || 5,
      accelX: this.lastAccelX,
      accelY: this.lastAccelY,
      accelZ: this.lastAccelZ,
      gyroX: 0,
      gyroY: 0,
      gyroZ: this.lastGyroZ,
    });
  };

  public stopListening(): void {
    if (typeof window !== 'undefined' && this.isMotionActive) {
      window.removeEventListener('devicemotion', this.handleMotion, true);
      this.isMotionActive = false;
    }

    if (typeof navigator !== 'undefined' && this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.callback = null;
  }
}
