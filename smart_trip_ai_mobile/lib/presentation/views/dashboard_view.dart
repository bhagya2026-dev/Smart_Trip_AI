import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../domain/models/telemetry.dart';
import '../../providers/trip_provider.dart';
import '../components/header_hud.dart';
import '../components/start_trip_hero_card.dart';
import '../components/live_navigation_panel.dart';
import '../components/speedometer_gforce_hud.dart';
import '../components/radial_score_gauge.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    final isSimulating = tripProvider.isSimulating;
    
    // For now, calculating dummy values or fetching from provider
    final coveredDistanceKm = tripProvider.isSimulating ? 1.2 : 0.0; 
    final remainingDistanceKm = 0.0;
    
    final currentPoint = TelemetryPoint(
      id: 'dummy',
      tripId: 'dummy',
      timestamp: DateTime.now().millisecondsSinceEpoch,
      latitude: 6.9,
      longitude: 79.8,
      speedKmH: tripProvider.isSimulating ? 45.0 : 0.0,
      accelX: 0,
      accelY: 9.8,
      accelZ: 0,
      gyroX: 0,
      gyroY: 0,
      gyroZ: 0,
      state: tripProvider.drivingState,
      gForceCombined: 1.0,
    );

    final score = DrivingScore(
      safetyScore: 100,
      ecoScore: 100,
      overallScore: 100,
      hardAccelerationsCount: 0,
      hardBrakesCount: 0,
      sharpSwervesCount: 0,
      idleTimeSeconds: 0,
      smoothDrivingDistanceKm: coveredDistanceKm,
    );

    return SingleChildScrollView(
      child: Container(
        color: const Color(0xFF0B1117),
        padding: const EdgeInsets.only(bottom: 100),
        child: Column(
          children: [
            // 1. Header Telematics HUD
            HeaderHUD(
              tripProvider: tripProvider,
            ),
            
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // 2. Destination Search Bar placeholder
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF16212B),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1F2A37)),
                    ),
                    child: const Row(
                      children: [
                        Icon(LucideIcons.search, color: Color(0xFF9FB3C8), size: 16),
                        SizedBox(width: 12),
                        Text('Search Wadduwa, Panadura, Kalutara...', style: TextStyle(color: Color(0xFF9FB3C8), fontSize: 12)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 3. Start Trip Hero Card
                  StartTripHeroCard(
                    isSimulating: isSimulating,
                    onStartTrip: tripProvider.startSimulation,
                    onEndTrip: tripProvider.stopSimulation,
                  ),
                  const SizedBox(height: 16),

                  // 4. Live Navigation Panel
                  LiveNavigationPanel(
                    destination: null,
                    coveredDistanceKm: coveredDistanceKm,
                    remainingDistanceKm: remainingDistanceKm,
                    currentSpeedKmH: currentPoint.speedKmH,
                    pitStops: const [],
                  ),
                  const SizedBox(height: 16),

                  // 5. Speedometer HUD
                  SpeedometerGForceHUD(
                    currentPoint: currentPoint,
                    maxSpeedKmH: 60.0,
                    vehicleConfig: tripProvider.vehicleConfig,
                    coveredDistanceKm: coveredDistanceKm,
                    idleDurationSeconds: 0,
                    routeDistanceKm: 15.0,
                  ),
                  const SizedBox(height: 16),

                  // 6. Radial Score Gauges
                  RadialScoreGauge(score: score),
                  const SizedBox(height: 16),

                  // 7. Map Placeholder
                  Container(
                    height: 250,
                    decoration: BoxDecoration(
                      color: const Color(0xFF16212B),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1F2A37)),
                      image: const DecorationImage(
                        image: NetworkImage('https://maps.googleapis.com/maps/api/staticmap?center=6.9271,79.8612&zoom=12&size=600x300&maptype=roadmap&key=DUMMY'),
                        fit: BoxFit.cover,
                      ),
                    ),
                    child: const Center(
                      child: Text('Interactive Route Map (Flutter Map)', style: TextStyle(color: Color(0xFF00E676), fontWeight: FontWeight.bold, backgroundColor: Colors.black54)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
