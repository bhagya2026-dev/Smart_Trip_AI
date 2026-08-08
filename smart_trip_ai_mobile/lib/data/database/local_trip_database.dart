import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../../domain/models/telemetry.dart';
import '../mock/mock_data.dart';

class LocalTripDatabase {
  static final LocalTripDatabase instance = LocalTripDatabase._init();
  static Database? _database;

  LocalTripDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('smart_trip_ai.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE trips (
        id TEXT PRIMARY KEY,
        title TEXT,
        start_time INTEGER,
        end_time INTEGER,
        duration_seconds INTEGER,
        distance_km REAL,
        max_speed_kmh REAL,
        avg_speed_kmh REAL,
        total_fuel_liters REAL,
        idle_fuel_liters REAL,
        total_cost REAL,
        idle_cost REAL,
        cost_saved_cruising REAL,
        safety_score REAL,
        eco_score REAL,
        hard_accelerations INTEGER,
        hard_brakes INTEGER,
        sharp_swerves INTEGER,
        status TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE pit_stops (
        id TEXT PRIMARY KEY,
        trip_id TEXT,
        start_time INTEGER,
        end_time INTEGER,
        duration_seconds INTEGER,
        latitude REAL,
        longitude REAL,
        address TEXT,
        category TEXT,
        name TEXT,
        idle_fuel_cost REAL,
        idle_fuel_liters REAL
      )
    ''');

    await db.execute('''
      CREATE TABLE telemetry_points (
        id TEXT PRIMARY KEY,
        trip_id TEXT,
        timestamp INTEGER,
        latitude REAL,
        longitude REAL,
        speed_kmh REAL,
        accel_z REAL,
        gyro_z REAL,
        state TEXT,
        safety_penalty TEXT
      )
    ''');
    
    // Seed initial mock data if empty
    for (var trip in initialMockTrips) {
      await _insertTrip(db, trip);
    }
  }

  Future<void> _insertTrip(Database db, Trip trip) async {
    await db.insert('trips', {
      'id': trip.id,
      'title': trip.title,
      'start_time': trip.startTime,
      'end_time': trip.endTime,
      'duration_seconds': trip.durationSeconds,
      'distance_km': trip.distanceKm,
      'max_speed_kmh': trip.maxSpeedKmH,
      'avg_speed_kmh': trip.avgSpeedKmH,
      'total_fuel_liters': trip.totalFuelLiters,
      'idle_fuel_liters': trip.idleFuelLiters,
      'total_cost': trip.totalCost,
      'idle_cost': trip.idleCost,
      'cost_saved_cruising': trip.costSavedCruising,
      'safety_score': trip.safetyScore,
      'eco_score': trip.ecoScore,
      'hard_accelerations': trip.hardAccelerations,
      'hard_brakes': trip.hardBrakes,
      'sharp_swerves': trip.sharpSwerves,
      'status': trip.status.toString().split('.').last,
    }, conflictAlgorithm: ConflictAlgorithm.replace);

    for (var stop in trip.pitStops) {
      await db.insert('pit_stops', {
        'id': stop.id,
        'trip_id': stop.tripId,
        'start_time': stop.startTime,
        'end_time': stop.endTime,
        'duration_seconds': stop.durationSeconds,
        'latitude': stop.latitude,
        'longitude': stop.longitude,
        'address': stop.address,
        'category': stop.category.toString().split('.').last,
        'name': stop.name,
        'idle_fuel_cost': stop.idleFuelCost,
        'idle_fuel_liters': stop.idleFuelLiters,
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }

    for (var pt in trip.telemetryPoints) {
      await db.insert('telemetry_points', {
        'id': pt.id,
        'trip_id': pt.tripId,
        'timestamp': pt.timestamp,
        'latitude': pt.latitude,
        'longitude': pt.longitude,
        'speed_kmh': pt.speedKmH,
        'accel_z': pt.accelZ,
        'gyro_z': pt.gyroZ,
        'state': pt.state.toString().split('.').last,
        'safety_penalty': pt.safetyPenalty,
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
  }

  Future<void> saveTrip(Trip trip) async {
    final db = await instance.database;
    await _insertTrip(db, trip);
  }

  Future<List<Trip>> getAllTrips() async {
    final db = await instance.database;
    final tripMaps = await db.query('trips');
    
    List<Trip> trips = [];
    for (var tripMap in tripMaps) {
      final tripId = tripMap['id'] as String;
      
      final stopMaps = await db.query('pit_stops', where: 'trip_id = ?', whereArgs: [tripId]);
      final ptMaps = await db.query('telemetry_points', where: 'trip_id = ?', whereArgs: [tripId]);
      
      final pitStops = stopMaps.map((s) => PitStop(
        id: s['id'] as String,
        tripId: s['trip_id'] as String,
        startTime: s['start_time'] as int,
        endTime: s['end_time'] as int?,
        durationSeconds: s['duration_seconds'] as int,
        latitude: s['latitude'] as double,
        longitude: s['longitude'] as double,
        address: s['address'] as String?,
        category: PitStopCategory.values.firstWhere((e) => e.toString().split('.').last == s['category']),
        name: s['name'] as String,
        idleFuelCost: s['idle_fuel_cost'] as double,
        idleFuelLiters: s['idle_fuel_liters'] as double,
      )).toList();

      final telemetryPoints = ptMaps.map((p) => TelemetryPoint(
        id: p['id'] as String,
        tripId: p['trip_id'] as String,
        timestamp: p['timestamp'] as int,
        latitude: p['latitude'] as double,
        longitude: p['longitude'] as double,
        speedKmH: p['speed_kmh'] as double,
        accelX: 0, accelY: 9.81, accelZ: p['accel_z'] as double,
        gyroX: 0, gyroY: 0, gyroZ: p['gyro_z'] as double,
        state: DrivingState.values.firstWhere((e) => e.toString().split('.').last == p['state']),
        gForceCombined: double.parse((1.0 + (p['accel_z'] as double).abs() / 9.81).toStringAsFixed(2)),
        safetyPenalty: p['safety_penalty'] as String?,
      )).toList();

      trips.add(Trip(
        id: tripId,
        title: tripMap['title'] as String,
        startTime: tripMap['start_time'] as int,
        endTime: tripMap['end_time'] as int?,
        durationSeconds: tripMap['duration_seconds'] as int,
        distanceKm: tripMap['distance_km'] as double,
        maxSpeedKmH: tripMap['max_speed_kmh'] as double,
        avgSpeedKmH: tripMap['avg_speed_kmh'] as double,
        totalFuelLiters: tripMap['total_fuel_liters'] as double,
        idleFuelLiters: tripMap['idle_fuel_liters'] as double,
        totalCost: tripMap['total_cost'] as double,
        idleCost: tripMap['idle_cost'] as double,
        costSavedCruising: tripMap['cost_saved_cruising'] as double,
        safetyScore: tripMap['safety_score'] as double,
        ecoScore: tripMap['eco_score'] as double,
        hardAccelerations: tripMap['hard_accelerations'] as int,
        hardBrakes: tripMap['hard_brakes'] as int,
        sharpSwerves: tripMap['sharp_swerves'] as int,
        status: TripStatus.values.firstWhere((e) => e.toString().split('.').last == tripMap['status']),
        pitStops: pitStops,
        telemetryPoints: telemetryPoints,
      ));
    }
    return trips;
  }
}

final localDB = LocalTripDatabase.instance;
