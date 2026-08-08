export type DrivingState = 'DRIVING' | 'IDLING' | 'PIT_STOP' | 'OFFLINE';

export interface TelemetryPoint {
  id: string;
  tripId: string;
  timestamp: number; // epoch ms
  latitude: number;
  longitude: number;
  altitude?: number;
  speedKmH: number;
  heading?: number; // 0-360 deg
  accuracy?: number; // meters

  // 3-axis Accelerometer (m/s^2)
  accelX: number; // Lateral (left/right)
  accelY: number; // Vertical (up/down)
  accelZ: number; // Longitudinal (forward/backward)

  // Gyroscope (deg/s)
  gyroX: number; // Pitch
  gyroY: number; // Roll
  gyroZ: number; // Yaw (turn rate)

  // Derived state
  state: DrivingState;
  gForceCombined: number; // Combined G-Force magnitude
  safetyPenalty?: string; // 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | null
}

export interface PitStop {
  id: string;
  tripId: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  latitude: number;
  longitude: number;
  address?: string;
  category: 'GAS_STATION' | 'COFFEE_SHOP' | 'REST_AREA' | 'PARKING' | 'CLIENT_SITE' | 'TRAFFIC_HOLD';
  name: string;
  idleFuelCost: number;
  idleFuelLiters: number;
}

export interface DrivingScore {
  safetyScore: number; // 0 - 100
  ecoScore: number;    // 0 - 100
  overallScore: number;// 0 - 100
  hardAccelerationsCount: number;
  hardBrakesCount: number;
  sharpSwervesCount: number;
  idleTimeSeconds: number;
  smoothDrivingDistanceKm: number;
}

export interface VehicleConfig {
  vehicleName: string;
  vehicleType: 'SEDAN' | 'SUV' | 'TRUCK' | 'HYBRID' | 'EV';
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
  engineSizeLiters: number; // e.g. 2.0
  idleConsumptionRateLph: number; // L/hour idle (e.g. 1.2 L/h)
  fuelPricePerLiter: number; // e.g. 1.45 $/L
}

export interface Trip {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  distanceKm: number;
  maxSpeedKmH: number;
  avgSpeedKmH: number;
  
  // Fuel & Cost Metrics
  totalFuelLiters: number;
  idleFuelLiters: number;
  totalCost: number;
  idleCost: number;
  costSavedCruising: number;

  // Driving & Pedestrian Metrics
  safetyScore: number;
  ecoScore: number;
  stepsCount?: number;
  caloriesBurned?: number;
  
  // Event Counters
  hardAccelerations: number;
  hardBrakes: number;
  sharpSwerves: number;
  
  // Polylines & Stops
  telemetryPoints: TelemetryPoint[];
  pitStops: PitStop[];
  status: 'ACTIVE' | 'COMPLETED';
}

export interface AIQueryResponse {
  query: string;
  generatedSQL: string;
  answerSummary: string;
  data: any[];
  visualizationType?: 'CARD' | 'TABLE' | 'BAR_CHART' | 'PIE_CHART';
  timestamp: number;
}
