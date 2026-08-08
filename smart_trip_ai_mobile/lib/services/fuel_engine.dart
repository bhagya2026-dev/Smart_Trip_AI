import '../domain/models/telemetry.dart';

final VehicleConfig defaultVehicleConfig = VehicleConfig(
  vehicleName: 'Toyota Lanka Cruiser (2.0L)',
  vehicleType: VehicleType.sedan,
  fuelType: FuelType.gasoline,
  engineSizeLiters: 2.0,
  idleConsumptionRateLph: 1.2, // 1.2 Liters/hour idling
  fuelPricePerLiter: 370.0,    // 370 LKR per liter (Sri Lankan Octane 92 / Diesel)
);

class IdleWasteResult {
  final double idleLiters;
  final double idleCost;
  final double costPerMinute;
  final double co2EmissionsKg;

  IdleWasteResult({
    required this.idleLiters,
    required this.idleCost,
    required this.costPerMinute,
    required this.co2EmissionsKg,
  });
}

class TripFuelMetricsResult {
  final double totalFuelLiters;
  final double idleFuelLiters;
  final double totalCost;
  final double idleCost;
  final double costSavedCruising;
  final double cruisingEfficiencyLPer100Km;

  TripFuelMetricsResult({
    required this.totalFuelLiters,
    required this.idleFuelLiters,
    required this.totalCost,
    required this.idleCost,
    required this.costSavedCruising,
    required this.cruisingEfficiencyLPer100Km,
  });
}

class FuelEngine {
  VehicleConfig config;

  FuelEngine([VehicleConfig? config])
      : config = config ?? defaultVehicleConfig;

  VehicleConfig updateConfig(VehicleConfig newConfig) {
    config = newConfig;
    return config;
  }

  VehicleConfig getConfig() {
    return config;
  }

  /// Calculate fuel wasted and monetary cost in LKR (Sri Lankan Rupees) during idle stationary state.
  IdleWasteResult calculateIdleWaste(int idleDurationSeconds) {
    final idleHours = idleDurationSeconds / 3600;
    final idleLiters = idleHours * config.idleConsumptionRateLph;
    final idleCost = idleLiters * config.fuelPricePerLiter;
    
    // Cost per minute while stuck idling in LKR
    final costPerMinute = (config.idleConsumptionRateLph / 60) * config.fuelPricePerLiter;

    // Approx CO2 emissions per Liter of gasoline = ~2.31 kg CO2
    final co2EmissionsKg = idleLiters * 2.31;

    return IdleWasteResult(
      idleLiters: double.parse(idleLiters.toStringAsFixed(3)),
      idleCost: double.parse(idleCost.toStringAsFixed(2)),
      costPerMinute: double.parse(costPerMinute.toStringAsFixed(2)),
      co2EmissionsKg: double.parse(co2EmissionsKg.toStringAsFixed(2)),
    );
  }

  /// Calculate overall trip fuel cost breakdown in LKR.
  TripFuelMetricsResult calculateTripFuelMetrics(
      double distanceKm, int idleDurationSeconds, double avgSpeedKmH) {
    final idleWaste = calculateIdleWaste(idleDurationSeconds);
    final idleLiters = idleWaste.idleLiters;
    final idleCost = idleWaste.idleCost;

    // Cruising efficiency model (approx 6.5 - 9.0 L/100km depending on engine size)
    final baseLPer100Km = 5.5 + config.engineSizeLiters * 1.2;
    
    // Speed efficiency curve multiplier (optimal speed ~60-80 km/h)
    double speedPenalty = 1.0;
    if (avgSpeedKmH > 0 && avgSpeedKmH < 30) {
      speedPenalty = 1.35; // Stop-and-go traffic jam penalty
    } else if (avgSpeedKmH > 100) {
      speedPenalty = 1.25; // High speed drag penalty
    }

    final cruisingLPer100Km = baseLPer100Km * speedPenalty;
    final cruisingLiters = (distanceKm / 100) * cruisingLPer100Km;
    final totalFuelLiters = cruisingLiters + idleLiters;

    final cruisingCost = cruisingLiters * config.fuelPricePerLiter;
    final totalCost = cruisingCost + idleCost;

    // Hypothetical savings if 70% of idle traffic jam time was smooth cruising
    final hypotheticalSavedIdleLiters = idleLiters * 0.7;
    final costSavedCruising = hypotheticalSavedIdleLiters * config.fuelPricePerLiter;

    return TripFuelMetricsResult(
      totalFuelLiters: double.parse(totalFuelLiters.toStringAsFixed(2)),
      idleFuelLiters: idleLiters,
      totalCost: double.parse(totalCost.toStringAsFixed(2)),
      idleCost: idleCost,
      costSavedCruising: double.parse(costSavedCruising.toStringAsFixed(2)),
      cruisingEfficiencyLPer100Km: double.parse(cruisingLPer100Km.toStringAsFixed(1)),
    );
  }
}
