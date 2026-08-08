import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../domain/models/telemetry.dart';
import '../../providers/trip_provider.dart';
import '../../services/pedometer_engine.dart';

class SpeedometerGForceHUD extends StatelessWidget {
  final TelemetryPoint? currentPoint;
  final double maxSpeedKmH;
  final VehicleConfig vehicleConfig;
  final double coveredDistanceKm;
  final int idleDurationSeconds;
  final TravelMode travelMode;
  final double routeDistanceKm;

  const SpeedometerGForceHUD({
    super.key,
    required this.currentPoint,
    required this.maxSpeedKmH,
    required this.vehicleConfig,
    required this.coveredDistanceKm,
    required this.idleDurationSeconds,
    this.travelMode = TravelMode.vehicle,
    this.routeDistanceKm = 0,
  });

  @override
  Widget build(BuildContext context) {
    final isWalking = travelMode == TravelMode.walking;
    final currentSpeedKmH = currentPoint?.speedKmH ?? 0;

    // Speed Math
    final currentSpeed = isWalking
        ? min(6.0, max(2.8, currentSpeedKmH > 0 ? currentSpeedKmH * 0.1 : 4.2))
        : currentSpeedKmH.roundToDouble();

    final maxGaugeSpeed = isWalking ? 10.0 : 140.0;
    final speedPercentage = min(100.0, (currentSpeed / maxGaugeSpeed) * 100);

    // SVG Circular Gauge Math
    const double radius = 54;
    const double circumference = 2 * pi * radius;
    final double strokeDashoffset = circumference - (speedPercentage / 100) * (circumference * 0.75);

    // Real-Time Hardware Accelerometer & GPS Pedometer Metrics
    final pedometerData = pedometerEngine.getSummary();
    final fallbackSteps = (coveredDistanceKm * 1310).round();
    final stepsTaken = max(pedometerData.stepsCount, fallbackSteps);
    final caloriesBurned = pedometerData.caloriesBurned > 0
        ? pedometerData.caloriesBurned
        : (coveredDistanceKm * 62).roundToDouble();

    // Accurate Vehicle Fuel Math (Engine-specific: ~8.2L/100km for 2.0L engine)
    final lPer100Km = 5.5 + (vehicleConfig.engineSizeLiters) * 1.35;
    final drivenLiters = (coveredDistanceKm / 100) * lPer100Km;
    final idleLiters = (idleDurationSeconds / 3600) * vehicleConfig.idleConsumptionRateLph;
    final totalLiveLiters = drivenLiters + idleLiters;
    final totalLiveCostLkr = totalLiveLiters * vehicleConfig.fuelPricePerLiter;

    // Expected Total Route Fuel Estimation
    final targetDistance = routeDistanceKm > 0 ? routeDistanceKm : coveredDistanceKm;
    final estTotalLiters = (targetDistance / 100) * lPer100Km;
    final estTotalCostLkr = estTotalLiters * vehicleConfig.fuelPricePerLiter;

    return GridView.count(
      crossAxisCount: MediaQuery.of(context).size.width > 768 ? 2 : 1,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        // 1. Speed / Walking Pace Gauge Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF16212B),
            border: Border.all(color: const Color(0xFF1F2A37)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        isWalking ? LucideIcons.footprints : LucideIcons.gauge,
                        color: isWalking ? const Color(0xFF00B8D4) : const Color(0xFF00E676),
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isWalking ? 'LIVE WALKING PACE' : 'LIVE VEHICLE SPEED',
                        style: const TextStyle(
                            color: Color(0xFFE6F1FF),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isWalking ? const Color(0xFF00B8D4).withOpacity(0.1) : const Color(0xFF00E676).withOpacity(0.1),
                      border: Border.all(color: isWalking ? const Color(0xFF00B8D4).withOpacity(0.3) : const Color(0xFF00E676).withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      isWalking
                          ? 'PEAK: \${maxSpeedKmH > 0 ? (maxSpeedKmH * 0.1).toStringAsFixed(1) : '5.2'} KM/H'
                          : 'MAX: \${maxSpeedKmH.round()} KM/H',
                      style: TextStyle(
                        color: isWalking ? const Color(0xFF00B8D4) : const Color(0xFF00E676),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
              Expanded(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 140,
                      height: 140,
                      child: Transform.rotate(
                        angle: 0.75 * pi, // Rotate -135 degrees = 225 degrees
                        child: CustomPaint(
                          painter: GaugePainter(
                            progress: speedPercentage / 100,
                            isWalking: isWalking,
                          ),
                        ),
                      ),
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          currentSpeed.toStringAsFixed(isWalking ? 1 : 0),
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'monospace',
                            color: Color(0xFFE6F1FF),
                          ),
                        ),
                        Text(
                          isWalking ? 'WALK KM/H' : 'VEHICLE KM/H',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: Color(0xFF9FB3C8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // 2. Fuel Spend (Vehicle) vs Steps & Calories (Walking)
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF16212B),
            border: Border.all(color: const Color(0xFF1F2A37)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        isWalking ? LucideIcons.sparkles : LucideIcons.fuel,
                        color: const Color(0xFF00B8D4),
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isWalking ? 'PEDESTRIAN FITNESS' : 'FUEL SPEND',
                        style: const TextStyle(
                            color: Color(0xFFE6F1FF),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00E676).withOpacity(0.1),
                      border: Border.all(color: const Color(0xFF00E676).withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      isWalking ? 'ZERO EMISSIONS' : 'Rs. \${vehicleConfig.fuelPricePerLiter}/L',
                      style: const TextStyle(
                        color: Color(0xFF00E676),
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ],
              ),
              const Divider(color: Color(0xFF1F2A37), height: 16),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111A23),
                        border: Border.all(color: const Color(0xFF1F2A37)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(isWalking ? LucideIcons.footprints : LucideIcons.wallet, color: const Color(0xFF00B8D4), size: 16),
                              const SizedBox(width: 6),
                              Text(isWalking ? 'REAL-TIME STEPS:' : 'SPENT SO FAR:',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF9FB3C8), fontFamily: 'monospace')),
                            ],
                          ),
                          Text(
                            isWalking ? '\$stepsTaken steps' : 'Rs. \${totalLiveCostLkr.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: isWalking ? const Color(0xFF00B8D4) : const Color(0xFF00E676),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF111A23),
                              border: Border.all(color: const Color(0xFF1F2A37)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    if (isWalking) const Icon(LucideIcons.flame, color: Color(0xFFFF5252), size: 12),
                                    if (isWalking) const SizedBox(width: 4),
                                    Text(isWalking ? 'CALORIES BURNED' : 'LIVE FUEL BURNED',
                                        style: const TextStyle(fontSize: 9, color: Color(0xFF9FB3C8))),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  isWalking ? '\$caloriesBurned kcal' : '\${totalLiveLiters.toStringAsFixed(2)} L',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                    color: isWalking ? const Color(0xFFFF5252) : const Color(0xFFE6F1FF),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF111A23),
                              border: Border.all(color: const Color(0xFF1F2A37)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(isWalking ? 'FUEL SAVED' : 'EST. TRIP FUEL',
                                    style: const TextStyle(fontSize: 9, color: Color(0xFF9FB3C8))),
                                const SizedBox(height: 4),
                                Text(
                                  isWalking ? '0.0 L (Rs. 0)' : '\${estTotalLiters.toStringAsFixed(2)} L',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                    color: isWalking ? const Color(0xFF00E676) : const Color(0xFF00B8D4),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class GaugePainter extends CustomPainter {
  final double progress;
  final bool isWalking;

  GaugePainter({required this.progress, required this.isWalking});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 10;
    
    final bgPaint = Paint()
      ..color = const Color(0xFF1F2A37)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    final fgPaint = Paint()
      ..color = isWalking ? const Color(0xFF00B8D4) : const Color(0xFF00E676)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    // Draw background arc (270 degrees = 1.5 pi)
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 0, 1.5 * pi, false, bgPaint);
    // Draw foreground arc
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 0, 1.5 * pi * progress, false, fgPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
