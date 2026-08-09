import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../domain/models/telemetry.dart';
import '../../providers/trip_provider.dart';

class RadialScoreGauge extends StatelessWidget {
  final DrivingScore score;
  final TravelMode travelMode;

  const RadialScoreGauge({
    super.key,
    required this.score,
    this.travelMode = TravelMode.vehicle,
  });

  Color _getScoreColor(double value) {
    return Colors.white;
  }

  String _getScoreLabel(double value) {
    if (value >= 90) return 'EXCELLENT';
    if (value >= 75) return 'GOOD';
    if (value >= 60) return 'FAIR';
    if (value >= 40) return 'MODERATE';
    return 'CRITICAL';
  }

  @override
  Widget build(BuildContext context) {
    final isWalking = travelMode == TravelMode.walking;
    final safetyColor = _getScoreColor(score.safetyScore);
    final ecoColor = _getScoreColor(score.ecoScore);

    return GridView.count(
      crossAxisCount: MediaQuery.of(context).size.width > 768 ? 2 : 1,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 2.2,
      children: [
        // 1. SAFETY / WALKING PACING SCORE CARD
        _buildScoreCard(
          title: isWalking ? 'WALKING CADENCE SCORE' : 'SAFETY SCORE',
          icon: isWalking ? LucideIcons.heartPulse : LucideIcons.shieldCheck,
          mainColor: isWalking ? const Color(0xFF00B8D4) : safetyColor,
          badgeLabel: isWalking ? 'OPTIMAL PACE' : _getScoreLabel(score.safetyScore),
          scoreValue: isWalking ? 100 : score.safetyScore,
          isWalking: isWalking,
          metrics: isWalking
              ? [
                  _MetricItem('Pacing:', 'Steady', Colors.white),
                  _MetricItem('Motion:', 'Smooth', Colors.white),
                  _MetricItem('Stoppages:', 'Minimal', Colors.white),
                ]
              : [
                  _MetricItem(
                      'Hard Accel:',
                      score.hardAccelerationsCount.toString(),
                      Colors.grey),
                  _MetricItem(
                      'Hard Brakes:',
                      score.hardBrakesCount.toString(),
                      Colors.grey),
                  _MetricItem(
                      'Sharp Swerves:',
                      score.sharpSwervesCount.toString(),
                      Colors.grey),
                ],
        ),

        // 2. ECO EFFICIENCY / GREEN FOOTPRINT SCORE CARD
        _buildScoreCard(
          title: isWalking ? 'CLEAN AIR FOOTPRINT' : 'ECO EFFICIENCY SCORE',
          icon: LucideIcons.leaf,
          mainColor: ecoColor,
          badgeLabel: isWalking ? 'ZERO CARBON' : _getScoreLabel(score.ecoScore),
          scoreValue: isWalking ? 100 : score.ecoScore,
          isWalking: isWalking,
          metrics: isWalking
              ? [
                  _MetricItem('Carbon Output:', '0 g CO₂', Colors.white),
                  _MetricItem('Eco Rating:', '100% GREEN', Colors.white),
                  _MetricItem('Health Bonus:', '+50 pts', Colors.white),
                ]
              : [
                  _MetricItem('Idle Time:', '${score.idleTimeSeconds}s', Colors.white),
                  _MetricItem('Eco Rating:', _getScoreLabel(score.ecoScore), Colors.grey),
                  _MetricItem('Idle Waste:', '0 pts', Colors.grey),
                ],
        ),
      ],
    );
  }

  Widget _buildScoreCard({
    required String title,
    required IconData icon,
    required Color mainColor,
    required String badgeLabel,
    required double scoreValue,
    required bool isWalking,
    required List<_MetricItem> metrics,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: const Color(0xFF333333)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: mainColor, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.black,
                  border: Border.all(color: const Color(0xFF333333)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  badgeLabel,
                  style: TextStyle(
                    color: mainColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 9,
                  ),
                ),
              ),
            ],
          ),
          const Divider(color: Color(0xFF333333), height: 16),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Circular Gauge
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 80,
                      height: 80,
                      child: Transform.rotate(
                        angle: -pi / 2,
                        child: CustomPaint(
                          painter: CircularScorePainter(
                            progress: scoreValue / 100,
                            color: mainColor,
                          ),
                        ),
                      ),
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          scoreValue.round().toString(),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const Text(
                          '/ 100',
                          style: TextStyle(
                            fontSize: 9,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                // Metrics List
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: metrics.map((m) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            m.label,
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            m.value,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: m.valueColor,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricItem {
  final String label;
  final String value;
  final Color valueColor;

  _MetricItem(this.label, this.value, this.valueColor);
}

class CircularScorePainter extends CustomPainter {
  final double progress;
  final Color color;

  CircularScorePainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;

    final bgPaint = Paint()
      ..color = const Color(0xFF333333)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;

    final fgPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 0, 2 * pi, false, bgPaint);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 0, 2 * pi * progress, false, fgPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
