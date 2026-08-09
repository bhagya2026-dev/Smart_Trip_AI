import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../providers/trip_provider.dart';

class ProfileView extends StatefulWidget {
  final int totalTripsCount;
  final double totalDistanceKm;
  final int avgSafetyScore;

  const ProfileView({
    super.key,
    required this.totalTripsCount,
    required this.totalDistanceKm,
    required this.avgSafetyScore,
  });

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  String userName = 'Sri Lanka Driver';
  String userTitle = 'Eco-Driver';
  bool isEditing = false;
  
  late TextEditingController _nameController;
  late TextEditingController _titleController;
  late TextEditingController _vehicleNameController;
  late TextEditingController _fuelPriceController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: userName);
    _titleController = TextEditingController(text: userTitle);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final tripProvider = context.read<TripProvider>();
    _vehicleNameController = TextEditingController(text: tripProvider.vehicleConfig.vehicleName);
    _fuelPriceController = TextEditingController(text: tripProvider.vehicleConfig.fuelPricePerLiter.toString());
  }

  @override
  void dispose() {
    _nameController.dispose();
    _titleController.dispose();
    _vehicleNameController.dispose();
    _fuelPriceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    final ecoScoreVal = 90;
    final overallRatingVal = ((widget.avgSafetyScore + ecoScoreVal) / 2).round();

    return SingleChildScrollView(
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        color: Colors.black,
        child: Column(
          children: [
            // 1. Driver Profile Hero Header Card
            _buildProfileHeader(tripProvider),
            const SizedBox(height: 24),

            // 2. Existing Driving Score Overview Gauges
            _buildScoreGauges(ecoScoreVal, overallRatingVal),
            const SizedBox(height: 24),

            // 3. Driver Badges & Telemetry Stats
            _buildTelemetryStats(),
            const SizedBox(height: 24),

            // 4. Driver Achievements Badges
            _buildAchievements(),
            const SizedBox(height: 24),

            // 5. Active Vehicle Profile Configuration
            _buildVehicleConfig(tripProvider),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(TripProvider tripProvider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Stack(
        children: [
          // Background Gradient Blur
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
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF333333), width: 1),
                    ),
                    child: const Center(
                      child: Icon(LucideIcons.user, size: 40, color: Colors.white),
                    ),
                  ),
                  Positioned(
                    bottom: -4,
                    right: -4,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00E676),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF0B1117), width: 2),
                      ),
                      child: const Icon(LucideIcons.sparkles, size: 12, color: Color(0xFF0B1117)),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              if (isEditing)
                                Expanded(
                                  child: TextField(
                                    controller: _nameController,
                                    style: const TextStyle(color: Color(0xFFE6F1FF), fontSize: 18, fontWeight: FontWeight.bold),
                                    decoration: const InputDecoration(
                                      isDense: true,
                                      contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    ),
                                    onChanged: (val) => userName = val,
                                  ),
                                )
                              else
                                Text(
                                  userName,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFFE6F1FF)),
                                ),
                              IconButton(
                                icon: const Icon(LucideIcons.edit3, size: 16, color: Color(0xFF9FB3C8)),
                                onPressed: () {
                                  setState(() {
                                    isEditing = !isEditing;
                                  });
                                },
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                iconSize: 16,
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF333333)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Text(
                                'LIVE GPS VERIFIED',
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (isEditing)
                      Padding(
                        padding: const EdgeInsets.only(top: 4.0),
                        child: TextField(
                          controller: _titleController,
                          style: const TextStyle(color: Colors.grey, fontSize: 12),
                          decoration: const InputDecoration(
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          ),
                          onChanged: (val) => userTitle = val,
                        ),
                      )
                    else
                      Text(
                        userTitle,
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.mapPin, size: 12, color: Color(0xFF00E676)),
                            SizedBox(width: 4),
                            Text('Sri Lanka Real-Time Location', style: TextStyle(color: Color(0xFF9FB3C8), fontSize: 10, fontFamily: 'monospace')),
                          ],
                        ),
                        const Text('•', style: TextStyle(color: Color(0xFF9FB3C8))),
                        Text(
                          tripProvider.vehicleConfig.vehicleName,
                          style: const TextStyle(color: Color(0xFF00E676), fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildScoreGauges(int ecoScoreVal, int overallRatingVal) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.shieldCheck, size: 16, color: Colors.white),
              SizedBox(width: 8),
              Text(
                'DRIVER SAFETY & TELEMATICS RATING',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            childAspectRatio: 0.75,
            children: [
              _buildGaugeItem('SAFETY SCORE', widget.avgSafetyScore, Colors.white, 'EXCELLENT RATING'),
              _buildGaugeItem('ECO EFFICIENCY', ecoScoreVal, Colors.white, 'HIGH EFFICIENCY'),
              _buildGaugeItem('OVERALL DRIVER RATING', overallRatingVal, Colors.white, 'VERIFIED DRIVER'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGaugeItem(String title, int score, Color color, String badge) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey), textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                score.toString(),
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
              ),
              const Padding(
                padding: EdgeInsets.only(bottom: 4, left: 4),
                child: Text('/ 100', style: TextStyle(fontSize: 8, color: Colors.grey)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: const Color(0xFF333333)),
            ),
            child: Text(
              badge,
              style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: color),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryStats() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard('TOTAL LOGGED TRIPS', '${widget.totalTripsCount} Drives', 'SQLite Persistence', Colors.white, LucideIcons.car),
        _buildStatCard('TOTAL DISTANCE', '${widget.totalDistanceKm.toStringAsFixed(1)} km', 'Covered in Sri Lanka', Colors.white, LucideIcons.leaf),
        _buildStatCard('SENSOR STREAM', 'REAL-TIME GPS', 'Hardware WatchPosition', Colors.white, LucideIcons.zap),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, String subtitle, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333), width: 1),
      ),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(title, style: const TextStyle(fontSize: 8, color: Colors.grey)),
              const SizedBox(height: 4),
              Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
              const SizedBox(height: 4),
              Text(subtitle, style: TextStyle(fontSize: 8, color: Colors.grey)),
            ],
          ),
          Positioned(
            right: 0,
            bottom: 0,
            child: Icon(icon, size: 32, color: color.withOpacity(0.2)),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievements() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.award, size: 16, color: Colors.white),
              SizedBox(width: 8),
              Text(
                'DRIVER ACHIEVEMENTS & CERTIFICATIONS',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildAchievementItem('Smooth Driver', 'Zero hard accel events', LucideIcons.shieldCheck, Colors.white),
          const SizedBox(height: 12),
          _buildAchievementItem('Eco Master', 'Efficient drive rating', LucideIcons.fuel, Colors.white),
          const SizedBox(height: 12),
          _buildAchievementItem('Sri Lanka Highways', 'Galle Road A2 Verified', LucideIcons.car, Colors.white),
        ],
      ),
    );
  }

  Widget _buildAchievementItem(String title, String subtitle, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: const Color(0xFF333333)),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
              Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleConfig(TripProvider tripProvider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.car, size: 16, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'REGISTERED VEHICLE SPECIFICATIONS',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Text('ACTIVE', style: TextStyle(fontSize: 10, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Vehicle Name:', style: TextStyle(fontSize: 10, color: Colors.grey)),
              const SizedBox(height: 4),
              TextField(
                controller: _vehicleNameController,
                style: const TextStyle(fontSize: 12, color: Colors.white),
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: Colors.black,
                  enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF333333))),
                  focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white)),
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                onSubmitted: (val) {
                  final config = tripProvider.vehicleConfig;
                  tripProvider.updateVehicleConfig(config.copyWith(vehicleName: val));
                },
              ),
              const SizedBox(height: 12),
              const Text('Fuel Price (LKR / Liter):', style: TextStyle(fontSize: 10, color: Colors.grey)),
              const SizedBox(height: 4),
              TextField(
                controller: _fuelPriceController,
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 12, color: Colors.white),
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: Colors.black,
                  enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF333333))),
                  focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white)),
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                onSubmitted: (val) {
                  final config = tripProvider.vehicleConfig;
                  final price = double.tryParse(val) ?? config.fuelPricePerLiter;
                  tripProvider.updateVehicleConfig(config.copyWith(fuelPricePerLiter: price));
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
