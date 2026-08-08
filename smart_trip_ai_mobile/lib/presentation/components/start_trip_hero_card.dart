import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class StartTripHeroCard extends StatelessWidget {
  final bool isSimulating;
  final VoidCallback onStartTrip;
  final VoidCallback onEndTrip;

  const StartTripHeroCard({
    super.key,
    required this.isSimulating,
    required this.onStartTrip,
    required this.onEndTrip,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF16212B),
        border: const Border(
          left: BorderSide(color: Color(0xFF00E676), width: 4),
          top: BorderSide(color: Color(0xFF1F2A37)),
          right: BorderSide(color: Color(0xFF1F2A37)),
          bottom: BorderSide(color: Color(0xFF1F2A37)),
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00E676).withOpacity(0.05),
            blurRadius: 20,
            spreadRadius: -5,
          )
        ],
      ),
      child: Stack(
        children: [
          // Background Ambient Glow
          Positioned(
            top: -50,
            right: -50,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF00E676).withOpacity(0.15),
                    Colors.transparent
                  ],
                ),
              ),
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00E676).withOpacity(0.15),
                    border: Border.all(color: const Color(0xFF00E676).withOpacity(0.4)),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'SRI LANKA INTELLIGENT TELEMATICS',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: Color(0xFF00E676),
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  isSimulating ? 'TRIP IN PROGRESS' : 'READY TO GO?',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFE6F1FF),
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isSimulating
                      ? 'Tracking live telemetry, G-force vectors, intermediate pit-stops, and fuel friction cost in real time.'
                      : 'Start your trip to track live telemetry, analyze idle fuel waste, and drive smarter across Sri Lanka.',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF9FB3C8),
                  ),
                ),
                const SizedBox(height: 16),
                
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isSimulating ? onEndTrip : onStartTrip,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isSimulating ? const Color(0xFFF44336) : const Color(0xFF00E676),
                      foregroundColor: isSimulating ? Colors.white : const Color(0xFF0B1117),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 8,
                      shadowColor: isSimulating ? const Color(0xFFF44336).withOpacity(0.5) : const Color(0xFF00E676).withOpacity(0.5),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(isSimulating ? LucideIcons.square : LucideIcons.play, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          isSimulating ? 'END TRIP & SAVE LOG' : 'START TRIP',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'monospace',
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                Row(
                  children: [
                    const Icon(LucideIcons.shieldCheck, color: Color(0xFF00E676), size: 14),
                    const SizedBox(width: 4),
                    const Text('Safety AI', style: TextStyle(fontSize: 11, fontFamily: 'monospace', color: Color(0xFF9FB3C8))),
                    const SizedBox(width: 16),
                    const Icon(LucideIcons.zap, color: Color(0xFF00B8D4), size: 14),
                    const SizedBox(width: 4),
                    const Text('Fuel Friction', style: TextStyle(fontSize: 11, fontFamily: 'monospace', color: Color(0xFF9FB3C8))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
