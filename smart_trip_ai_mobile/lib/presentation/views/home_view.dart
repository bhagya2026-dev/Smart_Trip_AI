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
        color: const Color(0xFF0B1117),
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
        color: const Color(0xFF16212B),
        border: Border.all(color: const Color(0xFF1F2A37)),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Hero Image Showcase
          Stack(
            children: [
              Image.network(
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 200,
                    width: double.infinity,
                    color: const Color(0xFF1F2A37),
                    child: const Icon(LucideIcons.image, color: Color(0xFF9FB3C8)),
                  );
                },
              ),
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        const Color(0xFF0B1117),
                        const Color(0xFF0B1117).withOpacity(0.5),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Hero Card Content
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF111A23), Color(0xFF0B1117)],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00E676).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF00E676).withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFF00E676),
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'SMARTTRIP AI TELEMATICS',
                            style: TextStyle(
                              color: Color(0xFF00E676),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
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
                          color: const Color(0xFF16212B),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF00E676).withOpacity(0.4)),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.user, size: 14, color: Color(0xFFE6F1FF)),
                            const SizedBox(width: 6),
                            const Text(
                              'Kasun',
                              style: TextStyle(
                                color: Color(0xFFE6F1FF),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                RichText(
                  text: const TextSpan(
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'Inter',
                      letterSpacing: -0.5,
                      color: Color(0xFFE6F1FF),
                    ),
                    children: [
                      TextSpan(text: 'DRIVE SMARTER ACROSS '),
                      TextSpan(
                        text: 'SRI LANKA',
                        style: TextStyle(color: Color(0xFF00B8D4)), // Approx gradient text
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Transform live device sensors into real-time driving safety scores, fuel friction cost analytics, and automated pit-stop logging.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF9FB3C8),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: onStartTrip,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00E676),
                          foregroundColor: const Color(0xFF0B1117),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 8,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.play, size: 14),
                            SizedBox(width: 8),
                            Text(
                              'START TRIP NOW',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
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
                          foregroundColor: const Color(0xFF00E676),
                          side: const BorderSide(color: Color(0xFF00E676)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
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
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
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
          iconColor: const Color(0xFF00E676),
          value: '\$trips',
          valueColor: const Color(0xFFE6F1FF),
          subtitle: 'Recorded Drives',
          onTap: () => onNavigateToTab(2), // HISTORY
        ),
        _buildStatCard(
          title: 'DISTANCE',
          icon: LucideIcons.navigation,
          iconColor: const Color(0xFF00B8D4),
          value: '\${distance.toStringAsFixed(1)} km',
          valueColor: const Color(0xFF00B8D4),
          subtitle: 'Covered so far',
          subtitleColor: const Color(0xFF9FB3C8),
          onTap: () => onNavigateToTab(1), // LIVE_HUD
        ),
        _buildStatCard(
          title: 'SAFETY RATING',
          icon: LucideIcons.shieldCheck,
          iconColor: const Color(0xFF00E676),
          value: '\$safety/100',
          valueColor: const Color(0xFF00E676),
          subtitle: 'EXCELLENT',
          subtitleColor: const Color(0xFF00E676),
          onTap: () => onNavigateToTab(1), // LIVE_HUD
        ),
        _buildStatCard(
          title: 'IDLE WASTED',
          icon: LucideIcons.flame,
          iconColor: const Color(0xFFFF5252),
          value: 'Rs. \${idleCost.toStringAsFixed(0)}',
          valueColor: const Color(0xFFFF5252),
          subtitle: 'Traffic Fuel Friction',
          subtitleColor: const Color(0xFF9FB3C8),
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
    Color subtitleColor = const Color(0xFF00E676),
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF16212B),
          border: Border.all(color: const Color(0xFF1F2A37)),
          borderRadius: BorderRadius.circular(12),
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
                  style: const TextStyle(fontSize: 10, color: Color(0xFF9FB3C8), fontFamily: 'monospace'),
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
              style: TextStyle(fontSize: 9, color: subtitleColor, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
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
                Icon(LucideIcons.compass, color: Color(0xFF00E676), size: 16),
                SizedBox(width: 8),
                Text(
                  'FEATURED SRI LANKA DESTINATIONS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: Color(0xFFE6F1FF),
                  ),
                ),
              ],
            ),
            const Text(
              'Tap to Navigate',
              style: TextStyle(
                fontSize: 10,
                fontFamily: 'monospace',
                color: Color(0xFF00B8D4),
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
                  color: const Color(0xFF16212B),
                  border: Border.all(color: const Color(0xFF1F2A37)),
                  borderRadius: BorderRadius.circular(12),
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
                            color: const Color(0xFF00E676).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(LucideIcons.mapPin, color: Color(0xFF00E676), size: 14),
                        ),
                        Text(
                          '~\${dest.distanceKmEst} km',
                          style: const TextStyle(
                            fontSize: 10,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF00E676),
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
                            color: Color(0xFFE6F1FF),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '\${dest.city}, Sri Lanka',
                          style: const TextStyle(
                            fontSize: 10,
                            fontFamily: 'monospace',
                            color: Color(0xFF9FB3C8),
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
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF00B8D4),
                          ),
                        ),
                        Icon(LucideIcons.arrowRight, color: Color(0xFF00B8D4), size: 12),
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
        gradient: const LinearGradient(
          colors: [Color(0xFF16212B), Color(0xFF111A23)],
        ),
        border: const Border(
          left: BorderSide(color: Color(0xFF00E676), width: 4),
          top: BorderSide(color: Color(0xFF1F2A37)),
          bottom: BorderSide(color: Color(0xFF1F2A37)),
          right: BorderSide(color: Color(0xFF1F2A37)),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.sparkles, color: Color(0xFF00E676), size: 16),
              SizedBox(width: 8),
              Text(
                'ON-DEVICE CONVERSATIONAL AI ASSISTANT',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: Color(0xFF00E676),
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
              color: Color(0xFFE6F1FF),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try asking: "How much money did I waste in traffic this week?" or "What was my highest eco score?"',
            style: TextStyle(
              fontSize: 12,
              color: Color(0xFF9FB3C8),
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () => onNavigateToTab(1),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF00E676),
              side: const BorderSide(color: Color(0xFF00E676)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('TRY AI CHAT', style: TextStyle(fontSize: 10, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
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
