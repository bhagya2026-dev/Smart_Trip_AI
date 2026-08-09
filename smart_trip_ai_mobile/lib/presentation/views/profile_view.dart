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
  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    final theme = Theme.of(context);
    final onSurface = theme.colorScheme.onSurface;
    final bg = theme.scaffoldBackgroundColor;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: bg,
        appBar: AppBar(
          backgroundColor: bg,
          elevation: 0,
          title: Text(
            'ecodriver_sl',
            style: TextStyle(color: onSurface, fontWeight: FontWeight.bold, fontSize: 18),
          ),
          actions: [
            IconButton(icon: Icon(LucideIcons.plusSquare, color: onSurface), onPressed: () {}),
            IconButton(icon: Icon(LucideIcons.menu, color: onSurface), onPressed: () {}),
          ],
        ),
        body: NestedScrollView(
          headerSliverBuilder: (context, _) {
            return [
              SliverToBoxAdapter(
                child: _buildProfileHeader(theme, tripProvider),
              ),
              SliverPersistentHeader(
                pinned: true,
                delegate: _SliverAppBarDelegate(
                  TabBar(
                    indicatorColor: onSurface,
                    labelColor: onSurface,
                    unselectedLabelColor: Colors.grey,
                    tabs: const [
                      Tab(icon: Icon(LucideIcons.grid)),
                      Tab(icon: Icon(LucideIcons.video)), // Mock reels/videos tab
                    ],
                  ),
                  bg,
                ),
              ),
            ];
          },
          body: TabBarView(
            children: [
              _buildTripGrid(theme),
              const Center(child: Text('No videos yet', style: TextStyle(color: Colors.grey))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(ThemeData theme, TripProvider tripProvider) {
    final onSurface = theme.colorScheme.onSurface;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Avatar
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: theme.dividerColor, width: 1.5),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: theme.dividerColor,
                    ),
                    child: Icon(LucideIcons.user, size: 40, color: onSurface),
                  ),
                ),
              ),
              // Stats
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildStatColumn('Trips', widget.totalTripsCount > 0 ? widget.totalTripsCount.toString() : '24', onSurface),
                    _buildStatColumn('Dist (km)', widget.totalDistanceKm > 0 ? widget.totalDistanceKm.toStringAsFixed(1) : '842', onSurface),
                    _buildStatColumn('EcoScore', widget.avgSafetyScore > 0 ? widget.avgSafetyScore.toString() : '92', onSurface),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Sri Lanka Driver',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: onSurface),
          ),
          const SizedBox(height: 4),
          Text(
            'Eco-Driver â€¢ Hybrid Vehicle enthusiast\nColombo ðŸ“',
            style: TextStyle(fontSize: 14, color: onSurface),
          ),
          const SizedBox(height: 4),
          Text(
            tripProvider.vehicleConfig.vehicleName,
            style: TextStyle(fontSize: 14, color: Colors.blue, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: onSurface,
                    side: BorderSide(color: theme.dividerColor),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  child: const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: onSurface,
                    side: BorderSide(color: theme.dividerColor),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  child: const Text('Share Profile', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  foregroundColor: onSurface,
                  side: BorderSide(color: theme.dividerColor),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                ),
                child: Icon(LucideIcons.userPlus, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String label, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: color),
        ),
      ],
    );
  }

  Widget _buildTripGrid(ThemeData theme) {
    final mockTrips = 12; // Just to fill the grid

    return GridView.builder(
      padding: const EdgeInsets.only(bottom: 100), // Space for footer
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 2,
        mainAxisSpacing: 2,
      ),
      itemCount: mockTrips,
      itemBuilder: (context, index) {
        return GestureDetector(
          onTap: () => _showTripDetailsDialog(index),
          child: Container(
          color: theme.dividerColor.withValues(alpha: 0.5),
          padding: const EdgeInsets.all(8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(LucideIcons.mapPin, color: theme.colorScheme.onSurface, size: 12),
                  Text('${15 + index} km', style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
              Center(
                child: Icon(LucideIcons.navigation, color: Colors.blue.withValues(alpha: 0.8), size: 24),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Score: ${98 - index}', style: TextStyle(color: Colors.green, fontSize: 9, fontWeight: FontWeight.bold)),
                  Text('Aug ${10 + index}', style: TextStyle(color: Colors.grey, fontSize: 9)),
                ],
              ),
            ],
          ),
        ));
      },
    );
  }

  void _showTripDetailsDialog(int index) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Trip Details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface)),
              const SizedBox(height: 16),
              _buildDetailRow(LucideIcons.calendar, 'Date', 'August ${10 + index}, 2026'),
              _buildDetailRow(LucideIcons.clock, 'Time', '08:30 AM - 09:15 AM'),
              _buildDetailRow(LucideIcons.hourglass, 'Duration', '45 mins'),
              _buildDetailRow(LucideIcons.navigation, 'Distance', '${15 + index} km'),
              _buildDetailRow(LucideIcons.gauge, 'Avg Speed', '42 km/h'),
              _buildDetailRow(LucideIcons.mapPin, 'From', 'Colombo'),
              _buildDetailRow(LucideIcons.flag, 'To', 'Galle'),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          const Spacer(),
          Text(value, style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  _SliverAppBarDelegate(this._tabBar, this._backgroundColor);

  final TabBar _tabBar;
  final Color _backgroundColor;

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: _backgroundColor,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return false;
  }
}


