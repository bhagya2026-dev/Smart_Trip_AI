import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../domain/models/destination.dart';
import '../../domain/models/telemetry.dart';
import '../../providers/trip_provider.dart';

class LiveNavigationPanel extends StatelessWidget {
  final Destination? destination;
  final double coveredDistanceKm;
  final double remainingDistanceKm;
  final double currentSpeedKmH;
  final List<PitStop> pitStops;
  final TravelMode travelMode;

  const LiveNavigationPanel({
    super.key,
    required this.destination,
    required this.coveredDistanceKm,
    required this.remainingDistanceKm,
    required this.currentSpeedKmH,
    required this.pitStops,
    this.travelMode = TravelMode.vehicle,
  });

  @override
  Widget build(BuildContext context) {
    final isWalking = travelMode == TravelMode.walking;
    final totalStopSeconds = pitStops.fold<int>(0, (acc, s) => acc + (s.durationSeconds));
    final stopMinutes = (totalStopSeconds / 60).round();

    // Realistic Sri Lanka Speed & Traffic Delay Math
    int etaMinsTotal = 0;
    if (destination != null && remainingDistanceKm > 0) {
      if (isWalking) {
        // Human Walking Pace (~4.2 km/h)
        const walkPaceKmH = 4.2;
        etaMinsTotal = ((remainingDistanceKm / walkPaceKmH) * 60).round();
        if (etaMinsTotal < 1) etaMinsTotal = 1;
      } else {
        // Sri Lanka Coastal City Traffic Average Speed (~24 km/h + traffic signal buffer)
        final realisticSriLankaCitySpeedKmH = currentSpeedKmH > 10 && currentSpeedKmH < 70 ? currentSpeedKmH : 24;
        final baseMins = (remainingDistanceKm / realisticSriLankaCitySpeedKmH) * 60;
        final trafficSignalBufferMins = remainingDistanceKm > 2 ? 3 : 1.5;
        etaMinsTotal = (baseMins + trafficSignalBufferMins).round();
        if (etaMinsTotal < 3) etaMinsTotal = 3;
      }
    }

    final etaH = (etaMinsTotal / 60).floor();
    final etaM = etaMinsTotal % 60;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: const Color(0xFF333333)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        children: [
          // Top Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.milestone, color: Colors.white, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    isWalking ? 'LIVE PEDESTRIAN WALK TELEMETRY' : 'LIVE TRIP TELEMETRY & NAVIGATION',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
              if (destination != null)
                  Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    border: Border.all(color: const Color(0xFF333333)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.flag, color: Colors.white, size: 12),
                      const SizedBox(width: 4),
                      Text(
                        'DEST: ${destination!.name.isNotEmpty ? destination!.name : destination!.city}',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const Divider(color: Color(0xFF333333), height: 24),

          // Grid Stats
          LayoutBuilder(
            builder: (context, constraints) {
              return GridView.count(
                crossAxisCount: constraints.maxWidth > 600 ? 4 : 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: constraints.maxWidth > 600 ? 1.2 : 1.5,
                children: [
                  // 1. Past Distance Covered
                  _buildStatCard(
                    title: 'PAST COVERED',
                    icon: LucideIcons.navigation,
                    iconColor: Colors.white,
                    value: '${coveredDistanceKm.toStringAsFixed(1)} ',
                    unit: 'km',
                    valueColor: Colors.white,
                    subtitle: isWalking ? 'Walked so far' : 'Driven so far',
                  ),

                  // 2. Remaining Distance
                  _buildStatCard(
                    title: 'REMAINING',
                    icon: LucideIcons.flag,
                    iconColor: Colors.white,
                    value: destination != null ? '${remainingDistanceKm.toStringAsFixed(1)} ' : '-- ',
                    unit: 'km',
                    valueColor: Colors.white,
                    subtitle: destination != null ? 'To ${destination!.name.isNotEmpty ? destination!.name : destination!.city}' : 'No target',
                  ),

                  // 3. Estimated Time of Arrival (ETA)
                  _buildStatCard(
                    title: 'ETA TIME',
                    icon: LucideIcons.clock,
                    iconColor: Colors.white,
                    value: destination != null ? (etaH > 0 ? '${etaH}h ${etaM}m' : '${etaM}m') : '--',
                    unit: '',
                    valueColor: Colors.white,
                    subtitle: isWalking ? 'Walking duration' : 'Traffic ETA duration',
                  ),

                  // 4. Intermediate Stops Summary
                  _buildStatCard(
                    title: 'INTERMEDIATE STOPS',
                    icon: LucideIcons.coffee,
                    iconColor: Colors.white,
                    value: '${pitStops.length} ',
                    unit: 'stops',
                    valueColor: Colors.white,
                    subtitle: stopMinutes > 0 ? '${stopMinutes}m spent paused' : 'No pauses',
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required String value,
    required String unit,
    required Color valueColor,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: const Color(0xFF333333)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 10, color: Colors.grey),
              ),
              Icon(icon, color: iconColor, size: 14),
            ],
          ),
          RichText(
            text: TextSpan(
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: valueColor),
              children: [
                TextSpan(text: value),
                TextSpan(
                  text: unit,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal, color: Colors.grey),
                ),
              ],
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 9, color: Colors.grey),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
