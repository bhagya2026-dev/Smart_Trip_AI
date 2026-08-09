import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../domain/models/destination.dart';
import '../../providers/trip_provider.dart';
import '../../data/mock/mock_data.dart';
import 'package:provider/provider.dart';

class HomeView extends StatelessWidget {
  final VoidCallback onStartTrip;
  final Function(Destination) onSelectDestination;
  final Function(int) onNavigateToTab;

  const HomeView({
    super.key,
    required this.onStartTrip,
    required this.onSelectDestination,
    required this.onNavigateToTab,
  });

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    // For now, pulling mock data for stats. In a real app, this comes from a database.
    final totalTripsCount = 3;
    final totalDistanceKm = 229.1;
    final totalIdleCost = 500.0;
    final avgSafetyScore = 84;

    return SingleChildScrollView(
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        color: Colors.black,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Futuristic Animated Hero Banner Card
            _buildHeroCard(),
            const SizedBox(height: 24),

            // 2. Quick Stat Overview Cards
            _buildStatOverviewCards(totalTripsCount, totalDistanceKm, avgSafetyScore, totalIdleCost),
            const SizedBox(height: 24),

            // 3. Popular Sri Lanka Destinations Cards
            _buildDestinations(),
            const SizedBox(height: 24),

            // 4. Conversational AI Assistant Banner Teaser
            _buildAITeaser(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: const Color(0xFF333333)),
        borderRadius: BorderRadius.circular(4),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Card Content
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.black,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111111),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF444444)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'SMARTTRIP TELEMATICS',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => onNavigateToTab(4), // PROFILE
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFF444444)),
                        ),
                        child: const Row(
                          children: [
                            Icon(LucideIcons.user, size: 14, color: Colors.white),
                            SizedBox(width: 6),
                            Text(
                              'Kasun',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'DRIVE SMARTER ACROSS SRI LANKA',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Transform live device sensors into real-time driving safety scores, fuel friction cost analytics, and automated pit-stop logging.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: onStartTrip,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.play, size: 14),
                            SizedBox(width: 8),
                            Text(
                              'START TRIP NOW',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => onNavigateToTab(1), // LIVE_HUD
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.activity, size: 14),
                            SizedBox(width: 8),
                            Text(
                              'OPEN LIVE HUD',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
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
    );
  }

  Widget _buildStatOverviewCards(int trips, double distance, int safety, double idleCost) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          title: 'TOTAL TRIPS',
          icon: LucideIcons.calendar,
          iconColor: Colors.white,
          value: '$trips',
          valueColor: Colors.white,
          subtitle: 'Recorded Drives',
          onTap: () => onNavigateToTab(2), // HISTORY
        ),
        _buildStatCard(
          title: 'DISTANCE',
          icon: LucideIcons.navigation,
          iconColor: Colors.white,
          value: '${distance.toStringAsFixed(1)} km',
          valueColor: Colors.white,
          subtitle: 'Covered so far',
          subtitleColor: Colors.grey,
          onTap: () => onNavigateToTab(1), // LIVE_HUD
        ),
        _buildStatCard(
          title: 'SAFETY RATING',
          icon: LucideIcons.shieldCheck,
          iconColor: Colors.white,
          value: '$safety/100',
          valueColor: Colors.white,
          subtitle: 'EXCELLENT',
          subtitleColor: Colors.white,
          onTap: () => onNavigateToTab(1), // LIVE_HUD
        ),
        _buildStatCard(
          title: 'IDLE WASTED',
          icon: LucideIcons.flame,
          iconColor: Colors.white,
          value: 'Rs. ${idleCost.toStringAsFixed(0)}',
          valueColor: Colors.white,
          subtitle: 'Traffic Fuel Friction',
          subtitleColor: Colors.grey,
          onTap: () => onNavigateToTab(3), // FUEL
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required String value,
    required Color valueColor,
    required String subtitle,
    Color subtitleColor = Colors.white,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: valueColor,
              ),
            ),
            Text(
              subtitle,
              style: TextStyle(fontSize: 9, color: subtitleColor, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDestinations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(LucideIcons.compass, color: Colors.white, size: 16),
                SizedBox(width: 8),
                Text(
                  'FEATURED SRI LANKA DESTINATIONS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const Text(
              'Tap to Navigate',
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GridView.builder(
          itemCount: 4,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.3,
          ),
          itemBuilder: (context, index) {
            final dest = mockDestinations[index];
            return GestureDetector(
              onTap: () {
                onSelectDestination(dest);
                onNavigateToTab(1);
              },
              child: Container(
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
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF333333)),
                          ),
                          child: const Icon(LucideIcons.mapPin, color: Colors.white, size: 14),
                        ),
                        Text(
                          '~${dest.distanceKmEst} km',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          dest.name,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '${dest.city}, Sri Lanka',
                          style: const TextStyle(
                            fontSize: 10,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'START ROUTE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Icon(LucideIcons.arrowRight, color: Colors.white, size: 12),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildAITeaser() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: const Color(0xFF333333), width: 1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.sparkles, color: Colors.white, size: 16),
              SizedBox(width: 8),
              Text(
                'ON-DEVICE CONVERSATIONAL AI ASSISTANT',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Query your driving scores & Sri Lanka fuel waste in natural language!',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try asking: "How much money did I waste in traffic this week?" or "What was my highest eco score?"',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () => onNavigateToTab(1),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: const BorderSide(color: Colors.white),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('TRY AI CHAT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                SizedBox(width: 4),
                Icon(LucideIcons.arrowRight, size: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
