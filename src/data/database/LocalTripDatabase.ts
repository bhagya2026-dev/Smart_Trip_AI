import alasql from 'alasql';
import type { Trip } from '../../domain/models/telemetry';
import { INITIAL_MOCK_TRIPS } from '../mock/mockData';

const LOCAL_STORAGE_KEY = 'smart_trip_ai_trips_v1';

export class LocalTripDatabase {
  private isInitialized = false;

  constructor() {
    this.initDatabase();
  }

  public initDatabase(): void {
    if (this.isInitialized) return;

    try {
      // Create relational SQL tables using AlaSQL
      alasql(`
        CREATE TABLE IF NOT EXISTS trips (
          id STRING PRIMARY KEY,
          title STRING,
          start_time INT,
          end_time INT,
          duration_seconds INT,
          distance_km FLOAT,
          max_speed_kmh FLOAT,
          avg_speed_kmh FLOAT,
          total_fuel_liters FLOAT,
          idle_fuel_liters FLOAT,
          total_cost FLOAT,
          idle_cost FLOAT,
          cost_saved_cruising FLOAT,
          safety_score INT,
          eco_score INT,
          hard_accelerations INT,
          hard_brakes INT,
          sharp_swerves INT,
          status STRING
        );

        CREATE TABLE IF NOT EXISTS pit_stops (
          id STRING PRIMARY KEY,
          trip_id STRING,
          start_time INT,
          end_time INT,
          duration_seconds INT,
          latitude FLOAT,
          longitude FLOAT,
          address STRING,
          category STRING,
          name STRING,
          idle_fuel_cost FLOAT,
          idle_fuel_liters FLOAT
        );

        CREATE TABLE IF NOT EXISTS telemetry_points (
          id STRING PRIMARY KEY,
          trip_id STRING,
          timestamp INT,
          latitude FLOAT,
          longitude FLOAT,
          speed_kmh FLOAT,
          accel_z FLOAT,
          gyro_z FLOAT,
          state STRING,
          safety_penalty STRING
        );
      `);

      // Load initial trips from LocalStorage or pre-populate with INITIAL_MOCK_TRIPS
      let tripsToInsert = INITIAL_MOCK_TRIPS;
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          tripsToInsert = JSON.parse(stored);
        } catch (e) {
          console.warn('Failed to parse local trip storage, using mock defaults');
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TRIPS));
      }

      this.seedTrips(tripsToInsert);
      this.isInitialized = true;
    } catch (err) {
      console.error('Error initializing SQL AlaSQL database:', err);
    }
  }

  private seedTrips(trips: Trip[]): void {
    try {
      alasql('DELETE FROM trips');
      alasql('DELETE FROM pit_stops');
      alasql('DELETE FROM telemetry_points');

      const seenStops = new Set<string>();
      const seenPts = new Set<string>();

      trips.forEach((trip) => {
        try {
          alasql(
            `INSERT INTO trips VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              trip.id,
              trip.title,
              trip.startTime,
              trip.endTime || trip.startTime,
              trip.durationSeconds,
              trip.distanceKm,
              trip.maxSpeedKmH,
              trip.avgSpeedKmH,
              trip.totalFuelLiters,
              trip.idleFuelLiters,
              trip.totalCost,
              trip.idleCost,
              trip.costSavedCruising,
              trip.safetyScore,
              trip.ecoScore,
              trip.hardAccelerations,
              trip.hardBrakes,
              trip.sharpSwerves,
              trip.status,
            ]
          );
        } catch (e) {}

        trip.pitStops.forEach((stop, idx) => {
          const stopKey = stop.id || `stop-${trip.id}-${idx}`;
          if (seenStops.has(stopKey)) return;
          seenStops.add(stopKey);
          try {
            alasql(
              `INSERT INTO pit_stops VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                stopKey,
                stop.tripId,
                stop.startTime,
                stop.endTime || stop.startTime,
                stop.durationSeconds,
                stop.latitude,
                stop.longitude,
                stop.address || '',
                stop.category,
                stop.name,
                stop.idleFuelCost,
                stop.idleFuelLiters,
              ]
            );
          } catch (e) {}
        });

        trip.telemetryPoints.forEach((pt, idx) => {
          const ptKey = pt.id || `pt-${trip.id}-${idx}`;
          if (seenPts.has(ptKey)) return;
          seenPts.add(ptKey);
          try {
            alasql(
              `INSERT INTO telemetry_points VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                ptKey,
                pt.tripId,
                pt.timestamp,
                pt.latitude,
                pt.longitude,
                pt.speedKmH,
                pt.accelZ,
                pt.gyroZ,
                pt.state,
                pt.safetyPenalty || '',
              ]
            );
          } catch (e) {}
        });
      });
    } catch (e) {
      console.warn('Seed trips warning:', e);
    }
  }

  public saveTrip(trip: Trip): void {
    const existing = this.getAllTrips();
    const updated = [trip, ...existing.filter((t) => t.id !== trip.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    this.seedTrips(updated);
  }

  public getAllTrips(): Trip[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    return INITIAL_MOCK_TRIPS;
  }

  /**
   * Execute raw SQL against local relational trip database.
   */
  public executeSQL(sql: string): any[] {
    try {
      const res = alasql(sql);
      return Array.isArray(res) ? res : [res];
    } catch (error: any) {
      console.error('SQL Execution Error:', error);
      throw new Error(`SQL syntax error: ${error.message}`);
    }
  }

  public resetToDefaults(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TRIPS));
    this.seedTrips(INITIAL_MOCK_TRIPS);
  }
}

export const localDB = new LocalTripDatabase();
