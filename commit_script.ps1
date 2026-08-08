cd "e:/1.PROFESSIONAL APPLICATIONS/SmartTripAi(dataodessy26)"

git add smart_trip_ai_mobile/pubspec.yaml smart_trip_ai_mobile/pubspec.lock smart_trip_ai_mobile/lib/main.dart smart_trip_ai_mobile/android smart_trip_ai_mobile/ios smart_trip_ai_mobile/web smart_trip_ai_mobile/windows smart_trip_ai_mobile/macos smart_trip_ai_mobile/linux smart_trip_ai_mobile/.metadata smart_trip_ai_mobile/README.md analysis_results.md
git commit -m "Initialize Flutter mobile port and add analysis"

git add smart_trip_ai_mobile/lib/domain/models/telemetry.dart smart_trip_ai_mobile/lib/domain/models/destination.dart
git commit -m "Port domain models for Telemetry and Destination"

git add smart_trip_ai_mobile/lib/domain/analytics/safety_eco_scorer.dart smart_trip_ai_mobile/lib/domain/state_machine/driving_state_processor.dart
git commit -m "Port SafetyEcoScorer and DrivingStateProcessor logic"

git add smart_trip_ai_mobile/lib/services/fuel_engine.dart smart_trip_ai_mobile/lib/services/pit_stop_detector.dart
git commit -m "Port FuelEngine and PitStopDetector services"

git add smart_trip_ai_mobile/lib/services/geocoding_service.dart smart_trip_ai_mobile/lib/services/pedometer_engine.dart
git commit -m "Port GeocodingService and PedometerEngine"

git add smart_trip_ai_mobile/lib/data/mock/mock_data.dart
git commit -m "Port initial mock data for trips"

git add smart_trip_ai_mobile/lib/data/database/local_trip_database.dart
git commit -m "Implement local SQLite database using sqflite"

git add smart_trip_ai_mobile/lib/data/sensors/telemetry_simulator.dart
git commit -m "Port TelemetrySimulator for real-time trip simulation"

git add smart_trip_ai_mobile/lib/data/sensors/device_sensor_provider.dart
git commit -m "Port DeviceSensorProvider for hardware GPS and sensors"

git add smart_trip_ai_mobile/lib/providers/trip_provider.dart smart_trip_ai_mobile/lib/main.dart
git commit -m "Set up application state management with TripProvider"

git add .
git commit -m "Catch all remaining flutter configurations and files"

git push origin main
