import type { VehicleConfig } from '../domain/models/telemetry';

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = {
  vehicleName: 'Toyota Lanka Cruiser (2.0L)',
  vehicleType: 'SEDAN',
  fuelType: 'GASOLINE',
  engineSizeLiters: 2.0,
  idleConsumptionRateLph: 1.2, // 1.2 Liters/hour idling
  fuelPricePerLiter: 370.0,    // 370 LKR per liter (Sri Lankan Octane 92 / Diesel)
};

export class FuelEngine {
  private config: VehicleConfig;

  constructor(config: VehicleConfig = DEFAULT_VEHICLE_CONFIG) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<VehicleConfig>): VehicleConfig {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }

  public getConfig(): VehicleConfig {
    return { ...this.config };
  }

  /**
   * Calculate fuel wasted and monetary cost in LKR (Sri Lankan Rupees) during idle stationary state.
   */
  public calculateIdleWaste(idleDurationSeconds: number): {
    idleLiters: number;
    idleCost: number; // LKR
    costPerMinute: number; // LKR / min
    co2EmissionsKg: number;
  } {
    const idleHours = idleDurationSeconds / 3600;
    const idleLiters = idleHours * this.config.idleConsumptionRateLph;
    const idleCost = idleLiters * this.config.fuelPricePerLiter;
    
    // Cost per minute while stuck idling in LKR
    const costPerMinute = (this.config.idleConsumptionRateLph / 60) * this.config.fuelPricePerLiter;

    // Approx CO2 emissions per Liter of gasoline = ~2.31 kg CO2
    const co2EmissionsKg = idleLiters * 2.31;

    return {
      idleLiters: parseFloat(idleLiters.toFixed(3)),
      idleCost: parseFloat(idleCost.toFixed(2)),
      costPerMinute: parseFloat(costPerMinute.toFixed(2)),
      co2EmissionsKg: parseFloat(co2EmissionsKg.toFixed(2)),
    };
  }

  /**
   * Calculate overall trip fuel cost breakdown in LKR.
   */
  public calculateTripFuelMetrics(
    distanceKm: number,
    idleDurationSeconds: number,
    avgSpeedKmH: number
  ): {
    totalFuelLiters: number;
    idleFuelLiters: number;
    totalCost: number; // LKR
    idleCost: number; // LKR
    costSavedCruising: number; // LKR
    cruisingEfficiencyLPer100Km: number;
  } {
    const { idleLiters, idleCost } = this.calculateIdleWaste(idleDurationSeconds);

    // Cruising efficiency model (approx 6.5 - 9.0 L/100km depending on engine size)
    const baseLPer100Km = 5.5 + this.config.engineSizeLiters * 1.2;
    
    // Speed efficiency curve multiplier (optimal speed ~60-80 km/h)
    let speedPenalty = 1.0;
    if (avgSpeedKmH > 0 && avgSpeedKmH < 30) {
      speedPenalty = 1.35; // Stop-and-go traffic jam penalty
    } else if (avgSpeedKmH > 100) {
      speedPenalty = 1.25; // High speed drag penalty
    }

    const cruisingLPer100Km = baseLPer100Km * speedPenalty;
    const cruisingLiters = (distanceKm / 100) * cruisingLPer100Km;
    const totalFuelLiters = cruisingLiters + idleLiters;

    const cruisingCost = cruisingLiters * this.config.fuelPricePerLiter;
    const totalCost = cruisingCost + idleCost;

    // Hypothetical savings if 70% of idle traffic jam time was smooth cruising
    const hypotheticalSavedIdleLiters = idleLiters * 0.7;
    const costSavedCruising = hypotheticalSavedIdleLiters * this.config.fuelPricePerLiter;

    return {
      totalFuelLiters: parseFloat(totalFuelLiters.toFixed(2)),
      idleFuelLiters: idleLiters,
      totalCost: parseFloat(totalCost.toFixed(2)),
      idleCost,
      costSavedCruising: parseFloat(costSavedCruising.toFixed(2)),
      cruisingEfficiencyLPer100Km: parseFloat(cruisingLPer100Km.toFixed(1)),
    };
  }
}
