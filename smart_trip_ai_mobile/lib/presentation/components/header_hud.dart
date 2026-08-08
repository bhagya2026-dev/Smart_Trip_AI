import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/trip_provider.dart';

class HeaderHUD extends StatelessWidget {
  final TripProvider tripProvider;

  const HeaderHUD({super.key, required this.tripProvider});

  String _formatTimer(int totalSeconds) {
    final hrs = totalSeconds ~/ 3600;
    final mins = (totalSeconds % 3600) ~/ 60;
    final secs = totalSeconds % 60;
    final minStr = mins.toString().padLeft(2, '0');
    final secStr = secs.toString().padLeft(2, '0');
    return hrs > 0 ? '\$hrs:\$minStr:\$secStr' : '\$minStr:\$secStr';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFA0B1117), // 95% opacity
        border: Border(bottom: BorderSide(color: Color(0xFF1F2A37))),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: SafeArea(
        bottom: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Logo & AI Badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8.0),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00E676), Color(0xFF00B8D4)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00E676).withOpacity(0.5),
                        blurRadius: 10,
                      )
                    ],
                  ),
                  child: const Icon(Icons.share, color: Color(0xFF0B1117), size: 20),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        RichText(
                          text: const TextSpan(
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                fontFamily: 'Inter',
                                letterSpacing: -0.5),
                            children: [
                              TextSpan(
                                  text: 'Smart',
                                  style: TextStyle(color: Color(0xFFE6F1FF))),
                              TextSpan(
                                  text: 'Trip',
                                  style: TextStyle(color: Color(0xFF00E676))),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00E676).withOpacity(0.15),
                            border: Border.all(
                                color: const Color(0xFF00E676).withOpacity(0.4)),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'AI',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                              color: Color(0xFF00E676),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Text(
                      'INTELLIGENT ROUTE TELEMATICS',
                      style: TextStyle(
                        fontSize: 9,
                        fontFamily: 'monospace',
                        color: Color(0xFF9FB3C8),
                      ),
                    ),
                  ],
                ),
              ],
            ),

            // Status Indicators
            Row(
              children: [
                // Hidden on very small screens typically, but shown here for simplicity
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                            color: Color(0xFF9FB3C8)),
                        children: [
                          const TextSpan(text: 'TIME: '),
                          TextSpan(
                            text: _formatTimer(tripProvider.activeTripDurationSec),
                            style: const TextStyle(
                                color: Color(0xFFE6F1FF),
                                fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                            color: Color(0xFF9FB3C8)),
                        children: [
                          const TextSpan(text: 'IDLE: '),
                          TextSpan(
                            text: 'Rs. \${tripProvider.liveIdleCostPerMin.toStringAsFixed(2)}/m',
                            style: const TextStyle(
                                color: Color(0xFFFFC107),
                                fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),

                // Live GPS Sensor Indicator Toggle
                GestureDetector(
                  onTap: () {
                    tripProvider.toggleLiveGps();
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: tripProvider.isLiveGpsActive
                          ? const Color(0xFF00E676).withOpacity(0.15)
                          : const Color(0xFF111A23),
                      border: Border.all(
                        color: tripProvider.isLiveGpsActive
                            ? const Color(0xFF00E676).withOpacity(0.4)
                            : const Color(0xFF1F2A37),
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: tripProvider.isLiveGpsActive
                          ? [
                              BoxShadow(
                                color: const Color(0xFF00E676).withOpacity(0.2),
                                blurRadius: 8,
                              )
                            ]
                          : [],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: tripProvider.isLiveGpsActive
                                ? const Color(0xFF00E676)
                                : const Color(0xFF9FB3C8),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'LIVE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: tripProvider.isLiveGpsActive
                                ? const Color(0xFF00E676)
                                : const Color(0xFF9FB3C8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Settings Button
                InkWell(
                  onTap: () {
                    // Open Settings
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF16212B),
                      border: Border.all(color: const Color(0xFF1F2A37)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      LucideIcons.settings,
                      color: Color(0xFF9FB3C8),
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
