import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../providers/trip_provider.dart';

class FuelAnalyticsView extends StatelessWidget {
  const FuelAnalyticsView({super.key});

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    final vehicleConfig = tripProvider.vehicleConfig;

    // Dummy values
    final totalIdleCost = 499.50;
    final totalIdleLiters = 1.35;
    final annualLossEst = 25974.00;

    return SingleChildScrollView(
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        color: const Color(0xFF0B1117),
        child: Column(
          children: [
            // Header Bar
            _buildHeader(vehicleConfig, totalIdleCost),
            const SizedBox(height: 24),

            // Main Metric Cards
            _buildMetricCards(totalIdleCost, totalIdleLiters, annualLossEst),
            const SizedBox(height: 24),

            // Vehicle Parameters Tuning Card
            _buildParametersTuning(tripProvider),
            const SizedBox(height: 24),

            // Eco Driving Recommendations Card
            _buildRecommendations(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(vehicleConfig, double totalIdleCost) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF16212B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1F2A37)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(LucideIcons.flame, size: 20, color: Color(0xFFFF5252)),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'FUEL FRICTION & IDLE COST ANALYZER',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: Color(0xFFE6F1FF),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                RichText(
                  text: TextSpan(
                    style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF9FB3C8)),
                    children: [
                      const TextSpan(text: 'Active Vehicle Profile: '),
                      TextSpan(text: vehicleConfig.vehicleName, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00E676))),
                      TextSpan(text: ' (\${vehicleConfig.engineSizeLiters.toStringAsFixed(1)}L Engine)'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFFF5252).withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFF5252).withOpacity(0.4)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFFF5252).withOpacity(0.2),
                  blurRadius: 8,
                )
              ],
            ),
            child: Text(
              'CONGESTION LOSS: Rs. \${totalIdleCost.toStringAsFixed(2)}',
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: Color(0xFFFF5252),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCards(double totalIdleCost, double totalIdleLiters, double annualLossEst) {
    return Column(
      children: [
        _buildMetricCard(
          'MONEY WASTED IDLING',
          'Rs. \${totalIdleCost.toStringAsFixed(2)}',
          'Direct cash burned while vehicle remained stationary in traffic.',
          const Color(0xFFFFC107),
          const Color(0xFF16212B),
        ),
        const SizedBox(height: 12),
        _buildMetricCard(
          'FUEL BURNED IN TRAFFIC',
          '\${totalIdleLiters.toStringAsFixed(2)} L',
          'Unproductively burned fuel in Sri Lankan traffic jams.',
          const Color(0xFFFF5252),
          const Color(0xFF16212B),
          borderColor: const Color(0xFFFF5252),
        ),
        const SizedBox(height: 12),
        _buildMetricCard(
          'PROJECTED ANNUAL TRAFFIC WASTE',
          'Rs. \${annualLossEst.toStringAsFixed(2)}',
          'Estimated yearly congestion friction based on weekly patterns.',
          const Color(0xFF00E676),
          const Color(0xFF16212B),
          borderColor: const Color(0xFF00E676),
        ),
      ],
    );
  }

  Widget _buildMetricCard(String title, String value, String description, Color valueColor, Color bgColor, {Color? borderColor}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border(
          left: BorderSide(color: borderColor ?? const Color(0xFF1F2A37), width: 4),
          top: const BorderSide(color: Color(0xFF1F2A37)),
          right: const BorderSide(color: Color(0xFF1F2A37)),
          bottom: const BorderSide(color: Color(0xFF1F2A37)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF9FB3C8))),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, fontFamily: 'monospace', color: valueColor)),
          const SizedBox(height: 8),
          Text(description, style: const TextStyle(fontSize: 10, color: Color(0xFF9FB3C8))),
        ],
      ),
    );
  }

  Widget _buildParametersTuning(TripProvider tripProvider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF16212B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1F2A37)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'ADJUST SRI LANKA FUEL & ENGINE PARAMETERS',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Color(0xFFE6F1FF)),
          ),
          const SizedBox(height: 20),
          _buildSlider(
            'Fuel Price:',
            'Rs. \${tripProvider.vehicleConfig.fuelPricePerLiter.toStringAsFixed(0)} / L',
            250.0,
            600.0,
            tripProvider.vehicleConfig.fuelPricePerLiter,
            (val) => tripProvider.updateVehicleConfig(tripProvider.vehicleConfig.copyWith(fuelPricePerLiter: val)),
          ),
          const SizedBox(height: 16),
          _buildSlider(
            'Idle Burn:',
            '\${tripProvider.vehicleConfig.idleConsumptionRateLph.toStringAsFixed(1)} L / Hour',
            0.5,
            3.5,
            tripProvider.vehicleConfig.idleConsumptionRateLph,
            (val) => tripProvider.updateVehicleConfig(tripProvider.vehicleConfig.copyWith(idleConsumptionRateLph: val)),
          ),
          const SizedBox(height: 16),
          _buildSlider(
            'Engine Size:',
            '\${tripProvider.vehicleConfig.engineSizeLiters.toStringAsFixed(1)} L',
            1.0,
            5.0,
            tripProvider.vehicleConfig.engineSizeLiters,
            (val) => tripProvider.updateVehicleConfig(tripProvider.vehicleConfig.copyWith(engineSizeLiters: val)),
          ),
        ],
      ),
    );
  }

  Widget _buildSlider(String label, String valueText, double min, double max, double value, Function(double) onChanged) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF9FB3C8))),
            Text(valueText, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Color(0xFF00E676))),
          ],
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          activeColor: const Color(0xFF00E676),
          inactiveColor: const Color(0xFF1F2A37),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildRecommendations() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF00E676).withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: const Border(
          left: BorderSide(color: Color(0xFF00E676), width: 4),
          top: BorderSide(color: Color(0xFF1F2A37)),
          right: BorderSide(color: Color(0xFF1F2A37)),
          bottom: BorderSide(color: Color(0xFF1F2A37)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.leaf, size: 16, color: Color(0xFF00E676)),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'TELEMATICS ECO-EFFICIENCY RECOMMENDATIONS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: Color(0xFF00E676),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildRecItem('Automatic Engine Start-Stop:', 'Shutting engine off on stops > 30 seconds eliminates up to 88% of idle friction.'),
          const SizedBox(height: 12),
          _buildRecItem('Anticipatory Braking:', 'Reducing hard braking events (< -4.0 m/s²) preserves kinetic momentum and saves 0.4L/100km.'),
          const SizedBox(height: 12),
          _buildRecItem('Optimum Highway Speed:', 'Cruising between 65–85 km/h minimizes aerodynamic drag overhead.'),
        ],
      ),
    );
  }

  Widget _buildRecItem(String boldPart, String textPart) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('✓ ', style: TextStyle(fontSize: 12, color: Color(0xFF00E676))),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFFE6F1FF)),
              children: [
                TextSpan(text: boldPart, style: const TextStyle(fontWeight: FontWeight.bold)),
                const TextSpan(text: ' '),
                TextSpan(text: textPart),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
