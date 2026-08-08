enum DrivingState {
  driving,
  idling,
  pitStop,
  offline
}

class TelemetryPoint {
  final String id;
  final String tripId;
  final int timestamp; // epoch ms
  final double latitude;
  final double longitude;
  final double? altitude;
  final double speedKmH;
  final double? heading; // 0-360 deg
  final double? accuracy; // meters

  // 3-axis Accelerometer (m/s^2)
  final double accelX; // Lateral (left/right)
  final double accelY; // Vertical (up/down)
  final double accelZ; // Longitudinal (forward/backward)

  // Gyroscope (deg/s)
  final double gyroX; // Pitch
  final double gyroY; // Roll
  final double gyroZ; // Yaw (turn rate)

  // Derived state
  final DrivingState state;
  final double gForceCombined; // Combined G-Force magnitude
  final String? safetyPenalty; // 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | null

  TelemetryPoint({
    required this.id,
    required this.tripId,
    required this.timestamp,
    required this.latitude,
    required this.longitude,
    this.altitude,
    required this.speedKmH,
    this.heading,
    this.accuracy,
    required this.accelX,
    required this.accelY,
    required this.accelZ,
    required this.gyroX,
    required this.gyroY,
    required this.gyroZ,
    required this.state,
    required this.gForceCombined,
    this.safetyPenalty,
  });
}

enum PitStopCategory {
  gasStation,
  coffeeShop,
  restArea,
  parking,
  clientSite,
  trafficHold
}

class PitStop {
  final String id;
  final String tripId;
  final int startTime;
  final int? endTime;
  final int durationSeconds;
  final double latitude;
  final double longitude;
  final String? address;
  final PitStopCategory category;
  final String name;
  final double idleFuelCost;
  final double idleFuelLiters;

  PitStop({
    required this.id,
    required this.tripId,
    required this.startTime,
    this.endTime,
    required this.durationSeconds,
    required this.latitude,
    required this.longitude,
    this.address,
    required this.category,
    required this.name,
    required this.idleFuelCost,
    required this.idleFuelLiters,
  });
}

class DrivingScore {
  final double safetyScore; // 0 - 100
  final double ecoScore;    // 0 - 100
  final double overallScore;// 0 - 100
  final int hardAccelerationsCount;
  final int hardBrakesCount;
  final int sharpSwervesCount;
  final int idleTimeSeconds;
  final double smoothDrivingDistanceKm;

  DrivingScore({
    required this.safetyScore,
    required this.ecoScore,
    required this.overallScore,
    required this.hardAccelerationsCount,
    required this.hardBrakesCount,
    required this.sharpSwervesCount,
    required this.idleTimeSeconds,
    required this.smoothDrivingDistanceKm,
  });
}

enum VehicleType { sedan, suv, truck, hybrid, ev }
enum FuelType { gasoline, diesel, hybrid, electric }

class VehicleConfig {
  final String vehicleName;
  final VehicleType vehicleType;
  final FuelType fuelType;
  final double engineSizeLiters; // e.g. 2.0
  final double idleConsumptionRateLph; // L/hour idle (e.g. 1.2 L/h)
  final double fuelPricePerLiter; // e.g. 1.45 $/L

  VehicleConfig({
    required this.vehicleName,
    required this.vehicleType,
    required this.fuelType,
    required this.engineSizeLiters,
    required this.idleConsumptionRateLph,
    required this.fuelPricePerLiter,
  });
}

enum TripStatus { active, completed }

class Trip {
  final String id;
  final String title;
  final int startTime;
  final int? endTime;
  final int durationSeconds;
  final double distanceKm;
  final double maxSpeedKmH;
  final double avgSpeedKmH;
  
  // Fuel & Cost Metrics
  final double totalFuelLiters;
  final double idleFuelLiters;
  final double totalCost;
  final double idleCost;
  final double costSavedCruising;

  // Driving & Pedestrian Metrics
  final double safetyScore;
  final double ecoScore;
  final int? stepsCount;
  final double? caloriesBurned;
  
  // Event Counters
  final int hardAccelerations;
  final int hardBrakes;
  final int sharpSwerves;
  
  // Polylines & Stops
  final List<TelemetryPoint> telemetryPoints;
  final List<PitStop> pitStops;
  final TripStatus status;

  Trip({
    required this.id,
    required this.title,
    required this.startTime,
    this.endTime,
    required this.durationSeconds,
    required this.distanceKm,
    required this.maxSpeedKmH,
    required this.avgSpeedKmH,
    required this.totalFuelLiters,
    required this.idleFuelLiters,
    required this.totalCost,
    required this.idleCost,
    required this.costSavedCruising,
    required this.safetyScore,
    required this.ecoScore,
    this.stepsCount,
    this.caloriesBurned,
    required this.hardAccelerations,
    required this.hardBrakes,
    required this.sharpSwerves,
    required this.telemetryPoints,
    required this.pitStops,
    required this.status,
  });
}

enum AIVisualizationType { card, table, barChart, pieChart }

class AIQueryResponse {
  final String query;
  final String generatedSQL;
  final String answerSummary;
  final List<dynamic> data;
  final AIVisualizationType? visualizationType;
  final int timestamp;

  AIQueryResponse({
    required this.query,
    required this.generatedSQL,
    required this.answerSummary,
    required this.data,
    this.visualizationType,
    required this.timestamp,
  });
}
