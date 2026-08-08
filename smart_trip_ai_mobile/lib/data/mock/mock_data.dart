import 'dart:math';
import '../../domain/models/telemetry.dart';

List<TelemetryPoint> generateMockPolylinePoints(
  double startLat,
  double startLng,
  double endLat,
  double endLng,
  int count,
) {
  final List<TelemetryPoint> points = [];
  final baseTime = DateTime.now().millisecondsSinceEpoch - 3600000;
  final random = Random();

  for (int i = 0; i < count; i++) {
    final ratio = i / (count - 1);
    final latJitter = sin(ratio * pi * 3) * 0.003;
    final lngJitter = cos(ratio * pi * 2) * 0.004;

    final lat = startLat + (endLat - startLat) * ratio + latJitter;
    final lng = startLng + (endLng - startLng) * ratio + lngJitter;

    DrivingState state = DrivingState.driving;
    double speed = 40 + sin(ratio * pi * 4) * 25;
    double accelZ = sin(ratio * 10) * 2.0;
    double gyroZ = cos(ratio * 12) * 15.0;
    String? penalty;

    if (i == 5) {
      accelZ = 4.2;
      penalty = 'HARD_ACCEL';
    } else if (i == 12) {
      speed = 1.5;
      state = DrivingState.idling;
      accelZ = -4.5;
      penalty = 'HARD_BRAKE';
    } else if (i == 18) {
      gyroZ = 52.0;
      penalty = 'SWERVE';
    }

    points.add(TelemetryPoint(
      id: 'pt-$i',
      tripId: 'mock-trip-lk',
      timestamp: baseTime + i * 120000,
      latitude: double.parse(lat.toStringAsFixed(5)),
      longitude: double.parse(lng.toStringAsFixed(5)),
      speedKmH: max(0, double.parse(speed.toStringAsFixed(1))),
      accelX: double.parse(((random.nextDouble() * 0.4) - 0.2).toStringAsFixed(2)),
      accelY: 9.81,
      accelZ: double.parse(accelZ.toStringAsFixed(2)),
      gyroX: 0,
      gyroY: 0,
      gyroZ: double.parse(gyroZ.toStringAsFixed(1)),
      state: state,
      gForceCombined: double.parse((1.0 + accelZ.abs() / 9.81).toStringAsFixed(2)),
      safetyPenalty: penalty,
    ));
  }

  return points;
}

final List<Trip> initialMockTrips = [
  Trip(
    id: 'trip-lk-101',
    title: 'Colombo Fort to Kollupitiya (Galle Road Traffic)',
    startTime: DateTime.now().millisecondsSinceEpoch - (86400000 * 1.2).toInt(),
    endTime: DateTime.now().millisecondsSinceEpoch - (86400000 * 1.2).toInt() + 2700000,
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
    status: TripStatus.completed,
    pitStops: [
      PitStop(
        id: 'stop-lk-1',
        tripId: 'trip-lk-101',
        startTime: DateTime.now().millisecondsSinceEpoch - (86400000 * 1.2).toInt() + 600000,
        endTime: DateTime.now().millisecondsSinceEpoch - (86400000 * 1.2).toInt() + 960000,
        durationSeconds: 360,
        latitude: 6.9271,
        longitude: 79.8612,
        address: 'Galle Road, Kollupitiya, Colombo 03',
        category: PitStopCategory.coffeeShop,
        name: 'Barista Coffee Pit-Stop',
        idleFuelCost: 51.80,
        idleFuelLiters: 0.14,
      ),
      PitStop(
        id: 'stop-lk-2',
        tripId: 'trip-lk-101',
        startTime: DateTime.now().millisecondsSinceEpoch - (86400000 * 1.2).toInt() + 1800000,
        endTime: DateTime.now().millisecondsSinceEpoch - (86400000 * 1.2).toInt() + 2280000,
        durationSeconds: 480,
        latitude: 6.9150,
        longitude: 79.8550,
        address: 'Bambalapitiya Junction Traffic Hold',
        category: PitStopCategory.trafficHold,
        name: 'Congested Intersection Idle Hold',
        idleFuelCost: 70.30,
        idleFuelLiters: 0.19,
      ),
    ],
    telemetryPoints: generateMockPolylinePoints(6.9271, 79.8612, 6.8950, 79.8580, 25),
  ),
];
