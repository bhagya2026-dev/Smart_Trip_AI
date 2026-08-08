import type { TelemetryPoint, Trip } from '../../domain/models/telemetry';

export const INITIAL_MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-lk-101',
    title: 'Colombo Fort to Kollupitiya (Galle Road Traffic)',
    startTime: Date.now() - 86400000 * 1.2,
    endTime: Date.now() - 86400000 * 1.2 + 2700000,
    durationSeconds: 2700,
    distanceKm: 16.2,
    maxSpeedKmH: 68,
    avgSpeedKmH: 21.6,
    totalFuelLiters: 2.65,
    idleFuelLiters: 0.68,
    totalCost: 980.50, // LKR
    idleCost: 251.60,  // LKR
    costSavedCruising: 176.00,
    safetyScore: 82,
    ecoScore: 71,
    hardAccelerations: 2,
    hardBrakes: 3,
    sharpSwerves: 1,
    status: 'COMPLETED',
    pitStops: [
      {
        id: 'stop-lk-1',
        tripId: 'trip-lk-101',
        startTime: Date.now() - 86400000 * 1.2 + 600000,
        endTime: Date.now() - 86400000 * 1.2 + 960000,
        durationSeconds: 360,
        latitude: 6.9271,
        longitude: 79.8612,
        address: 'Galle Road, Kollupitiya, Colombo 03',
        category: 'COFFEE_SHOP',
        name: 'Barista Coffee Pit-Stop',
        idleFuelCost: 51.80,
        idleFuelLiters: 0.14,
      },
      {
        id: 'stop-lk-2',
        tripId: 'trip-lk-101',
        startTime: Date.now() - 86400000 * 1.2 + 1800000,
        endTime: Date.now() - 86400000 * 1.2 + 2280000,
        durationSeconds: 480,
        latitude: 6.9150,
        longitude: 79.8550,
        address: 'Bambalapitiya Junction Traffic Hold',
        category: 'TRAFFIC_HOLD',
        name: 'Congested Intersection Idle Hold',
        idleFuelCost: 70.30,
        idleFuelLiters: 0.19,
      },
    ],
    telemetryPoints: generateMockPolylinePoints(6.9271, 79.8612, 6.8950, 79.8580, 25),
  },
  {
    id: 'trip-lk-102',
    title: 'Southern Expressway E01 (Kottawa to Galle Interchange)',
    startTime: Date.now() - 86400000 * 2.5,
    endTime: Date.now() - 86400000 * 2.5 + 3600000,
    durationSeconds: 3600,
    distanceKm: 98.4,
    maxSpeedKmH: 104,
    avgSpeedKmH: 98.4,
    totalFuelLiters: 6.20,
    idleFuelLiters: 0.12,
    totalCost: 2294.00, // LKR
    idleCost: 44.40,    // LKR
    costSavedCruising: 540.00,
    safetyScore: 97,
    ecoScore: 95,
    hardAccelerations: 0,
    hardBrakes: 1,
    sharpSwerves: 0,
    status: 'COMPLETED',
    pitStops: [
      {
        id: 'stop-lk-3',
        tripId: 'trip-lk-102',
        startTime: Date.now() - 86400000 * 2.5 + 1800000,
        endTime: Date.now() - 86400000 * 2.5 + 2100000,
        durationSeconds: 300,
        latitude: 6.6400,
        longitude: 80.1200,
        address: 'Welipenna Rest Area Plaza E01',
        category: 'REST_AREA',
        name: 'Welipenna Expressway Rest Stop',
        idleFuelCost: 44.40,
        idleFuelLiters: 0.12,
      },
    ],
    telemetryPoints: generateMockPolylinePoints(6.8400, 79.9500, 6.0535, 80.2210, 30),
  },
  {
    id: 'trip-lk-103',
    title: 'Colombo to Kandy Hill Country Pass',
    startTime: Date.now() - 86400000 * 4.1,
    endTime: Date.now() - 86400000 * 4.1 + 5400000,
    durationSeconds: 5400,
    distanceKm: 114.5,
    maxSpeedKmH: 82,
    avgSpeedKmH: 76.3,
    totalFuelLiters: 8.40,
    idleFuelLiters: 0.55,
    totalCost: 3108.00, // LKR
    idleCost: 203.50,   // LKR
    costSavedCruising: 370.00,
    safetyScore: 74,
    ecoScore: 68,
    hardAccelerations: 4,
    hardBrakes: 5,
    sharpSwerves: 6,
    status: 'COMPLETED',
    pitStops: [
      {
        id: 'stop-lk-4',
        tripId: 'trip-lk-103',
        startTime: Date.now() - 86400000 * 4.1 + 2400000,
        endTime: Date.now() - 86400000 * 4.1 + 2700000,
        durationSeconds: 300,
        latitude: 7.2500,
        longitude: 80.4500,
        address: 'Pasyala Ceypetco Filling Station',
        category: 'GAS_STATION',
        name: 'Ceypetco Fuel Station',
        idleFuelCost: 55.50,
        idleFuelLiters: 0.15,
      },
    ],
    telemetryPoints: generateMockPolylinePoints(6.9271, 79.8612, 7.2906, 80.6337, 25),
  },
];

export function generateMockPolylinePoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  count: number
): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const baseTime = Date.now() - 3600000;

  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1);
    const latJitter = Math.sin(ratio * Math.PI * 3) * 0.003;
    const lngJitter = Math.cos(ratio * Math.PI * 2) * 0.004;

    const lat = startLat + (endLat - startLat) * ratio + latJitter;
    const lng = startLng + (endLng - startLng) * ratio + lngJitter;

    let state: TelemetryPoint['state'] = 'DRIVING';
    let speed = 40 + Math.sin(ratio * Math.PI * 4) * 25;
    let accelZ = Math.sin(ratio * 10) * 2.0;
    let gyroZ = Math.cos(ratio * 12) * 15.0;
    let penalty: TelemetryPoint['safetyPenalty'] = undefined;

    if (i === 5) {
      accelZ = 4.2;
      penalty = 'HARD_ACCEL';
    } else if (i === 12) {
      speed = 1.5;
      state = 'IDLING';
      accelZ = -4.5;
      penalty = 'HARD_BRAKE';
    } else if (i === 18) {
      gyroZ = 52.0;
      penalty = 'SWERVE';
    }

    points.push({
      id: `pt-${i}`,
      tripId: 'mock-trip-lk',
      timestamp: baseTime + i * 120000,
      latitude: parseFloat(lat.toFixed(5)),
      longitude: parseFloat(lng.toFixed(5)),
      speedKmH: Math.max(0, parseFloat(speed.toFixed(1))),
      accelX: parseFloat((Math.random() * 0.4 - 0.2).toFixed(2)),
      accelY: 9.81,
      accelZ: parseFloat(accelZ.toFixed(2)),
      gyroX: 0,
      gyroY: 0,
      gyroZ: parseFloat(gyroZ.toFixed(1)),
      state,
      gForceCombined: parseFloat((1.0 + Math.abs(accelZ) / 9.81).toFixed(2)),
      safetyPenalty: penalty,
    });
  }

  return points;
}
