import type { PitStop, TelemetryPoint } from '../domain/models/telemetry';
import { FuelEngine } from './fuelEngine';

const CATEGORY_TAGS: Array<{
  category: PitStop['category'];
  name: string;
  keywords: string[];
}> = [
  { category: 'COFFEE_SHOP', name: 'Starbucks / Coffee Haven', keywords: ['coffee', 'cafe', 'bistro'] },
  { category: 'GAS_STATION', name: 'Shell / Energy Station', keywords: ['fuel', 'gas', 'shell', 'bp'] },
  { category: 'REST_AREA', name: 'Highway Rest Stop', keywords: ['rest', 'highway', 'plaza'] },
  { category: 'CLIENT_SITE', name: 'Downtown Tech Hub', keywords: ['office', 'tech', 'building'] },
  { category: 'PARKING', name: 'Central Parking Garage', keywords: ['parking', 'garage', 'lot'] },
  { category: 'TRAFFIC_HOLD', name: 'Severe Traffic Jam', keywords: ['traffic', 'jam', 'signal'] },
];

export class PitStopDetector {
  private activeStop: Partial<PitStop> | null = null;
  private fuelEngine: FuelEngine;

  constructor(fuelEngine: FuelEngine) {
    this.fuelEngine = fuelEngine;
  }

  /**
   * Process state change and point to detect and manage PitStops.
   */
  public evaluatePoint(
    point: TelemetryPoint,
    previousState: string
  ): PitStop | null {
    const isStopState = point.state === 'PIT_STOP' || point.state === 'IDLING';

    if (isStopState) {
      if (!this.activeStop) {
        // Initialize a new Pit-Stop cluster candidate
        const categoryMatch = this.predictCategory(point);
        this.activeStop = {
          id: `stop-${Date.now()}`,
          tripId: point.tripId,
          startTime: point.timestamp,
          latitude: point.latitude,
          longitude: point.longitude,
          category: categoryMatch.category,
          name: categoryMatch.name,
          address: `${point.latitude.toFixed(4)}° N, ${point.longitude.toFixed(4)}° W`,
          idleFuelCost: 0,
          idleFuelLiters: 0,
          durationSeconds: 0,
        };
      } else {
        // Update ongoing stop duration & fuel cost
        const durationSec = Math.round((point.timestamp - (this.activeStop.startTime || point.timestamp)) / 1000);
        const fuelWaste = this.fuelEngine.calculateIdleWaste(durationSec);

        this.activeStop.durationSeconds = durationSec;
        this.activeStop.idleFuelLiters = fuelWaste.idleLiters;
        this.activeStop.idleFuelCost = fuelWaste.idleCost;
      }
    } else if (previousState === 'PIT_STOP' || previousState === 'IDLING') {
      // Vehicle resumed movement -> Close and finalize pit stop
      if (this.activeStop && (this.activeStop.durationSeconds || 0) >= 30) {
        const completedStop: PitStop = {
          ...(this.activeStop as PitStop),
          endTime: point.timestamp,
        };
        this.activeStop = null;
        return completedStop;
      }
      this.activeStop = null;
    }

    return null;
  }

  public getActiveStop(): Partial<PitStop> | null {
    return this.activeStop;
  }

  public predictCategory(point: TelemetryPoint): { category: PitStop['category']; name: string } {
    // Spatial deterministic pseudo-picker for realistic demo stopping tags based on coords
    const latHash = Math.abs(Math.floor(point.latitude * 1000)) % CATEGORY_TAGS.length;
    const item = CATEGORY_TAGS[latHash] || CATEGORY_TAGS[0];
    return {
      category: item.category,
      name: item.name,
    };
  }

  public reset(): void {
    this.activeStop = null;
  }
}
