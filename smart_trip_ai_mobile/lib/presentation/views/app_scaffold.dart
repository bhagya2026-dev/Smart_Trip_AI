import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'home_view.dart';
import 'dashboard_view.dart';
import 'trip_history_view.dart';
import 'fuel_analytics_view.dart';
import 'profile_view.dart';
import '../components/smart_trip_ai_chat.dart';

class AppScaffold extends StatefulWidget {
  const AppScaffold({super.key});

  @override
  State<AppScaffold> createState() => _AppScaffoldState();
}

class _AppScaffoldState extends State<AppScaffold> {
  int _currentIndex = 0;

  void _onNavigateToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          backgroundColor: const Color(0xFF0B1117),
          body: IndexedStack(
            index: _currentIndex,
            children: [
              HomeView(
                onStartTrip: () {
                  _onNavigateToTab(1);
                },
                onSelectDestination: (dest) {
                },
                onNavigateToTab: _onNavigateToTab,
              ),
              const DashboardView(),
              const TripHistoryView(),
              const FuelAnalyticsView(),
              const ProfileView(
                totalTripsCount: 3,
                totalDistanceKm: 229.1,
                avgSafetyScore: 84,
              ),
            ],
          ),
          bottomNavigationBar: Container(
            decoration: const BoxDecoration(
              color: Color(0xFA0B1117),
              border: Border(top: BorderSide(color: Color(0xFF1F2A37))),
            ),
            child: SafeArea(
              child: BottomNavigationBar(
                currentIndex: _currentIndex,
                onTap: _onNavigateToTab,
                backgroundColor: Colors.transparent,
                type: BottomNavigationBarType.fixed,
                elevation: 0,
                selectedItemColor: const Color(0xFF00E676),
                unselectedItemColor: const Color(0xFF9FB3C8),
                selectedLabelStyle: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
                unselectedLabelStyle: const TextStyle(
                  fontSize: 9,
                  fontFamily: 'monospace',
                ),
                items: const [
                  BottomNavigationBarItem(
                    icon: Padding(padding: EdgeInsets.only(bottom: 4), child: Icon(LucideIcons.home, size: 20)),
                    label: 'Home',
                  ),
                  BottomNavigationBarItem(
                    icon: Padding(padding: EdgeInsets.only(bottom: 4), child: Icon(LucideIcons.layoutDashboard, size: 20)),
                    label: 'Live HUD',
                  ),
                  BottomNavigationBarItem(
                    icon: Padding(padding: EdgeInsets.only(bottom: 4), child: Icon(LucideIcons.calendar, size: 20)),
                    label: 'Trip Logs',
                  ),
                  BottomNavigationBarItem(
                    icon: Padding(padding: EdgeInsets.only(bottom: 4), child: Icon(LucideIcons.flame, size: 20)),
                    label: 'Fuel',
                  ),
                  BottomNavigationBarItem(
                    icon: Padding(padding: EdgeInsets.only(bottom: 4), child: Icon(LucideIcons.user, size: 20)),
                    label: 'Profile',
                  ),
                ],
              ),
            ),
          ),
        ),
        const SmartTripAIChat(),
      ],
    );
  }
}
