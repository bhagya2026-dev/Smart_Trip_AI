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
        color: const Color(0xFF000000),
        border: Border.all(color: const Color(0xFF333333), width: 1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF111111),
                border: Border.all(color: const Color(0xFF444444)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'SRI LANKA TELEMATICS',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 1.0,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              isSimulating ? 'TRIP IN PROGRESS' : 'READY TO GO?',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isSimulating
                  ? 'Tracking live telemetry, G-force vectors, and stops.'
                  : 'Start your trip to track telemetry and analyze fuel waste.',
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFFAAAAAA),
              ),
            ),
            const SizedBox(height: 16),
            
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: isSimulating ? onEndTrip : onStartTrip,
                style: ElevatedButton.styleFrom(
                  backgroundColor: isSimulating ? Colors.white : Colors.white,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(isSimulating ? LucideIcons.square : LucideIcons.play, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      isSimulating ? 'END TRIP' : 'START TRIP',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
