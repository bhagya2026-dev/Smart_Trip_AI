import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../domain/models/telemetry.dart';
import '../../providers/trip_provider.dart';
import '../../data/mock/mock_data.dart'; // Just for dummy data display since DB is empty

class TripHistoryView extends StatefulWidget {
  const TripHistoryView({super.key});

  @override
  State<TripHistoryView> createState() => _TripHistoryViewState();
}

class _TripHistoryViewState extends State<TripHistoryView> {
  String _filterSort = 'DATE';

  @override
  Widget build(BuildContext context) {
    // We can pull trips from local database via provider. Here we use mock data for visuals
    final trips = initialMockTrips;

    final sortedTrips = List<Trip>.from(trips);
    sortedTrips.sort((a, b) {
      if (_filterSort == 'ECO') return b.ecoScore.compareTo(a.ecoScore);
      if (_filterSort == 'DISTANCE') return b.distanceKm.compareTo(a.distanceKm);
      if (_filterSort == 'IDLE_COST') return b.idleCost.compareTo(a.idleCost);
      return b.startTime.compareTo(a.startTime);
    });

    return SingleChildScrollView(
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        color: Colors.black,
        child: Column(
          children: [
            // Header Bar
            _buildHeader(),
            const SizedBox(height: 24),

            if (sortedTrips.isEmpty)
              _buildEmptyState()
            else
              _buildTripsList(sortedTrips),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
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
              Icon(LucideIcons.calendar, size: 20, color: Colors.white),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'HISTORICAL TRIP TELEMETRY & LOGS',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Relational SQLite persistent storage | 3 Recorded Trips',
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: const Color(0xFF333333)),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.filter, size: 14, color: Colors.grey),
                      const SizedBox(width: 8),
                      const Text('Sort:', style: TextStyle(fontSize: 10, color: Colors.grey)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _filterSort,
                            isExpanded: true,
                            dropdownColor: Colors.black,
                            icon: const Icon(LucideIcons.chevronDown, size: 14, color: Colors.white),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                            onChanged: (val) {
                              if (val != null) setState(() => _filterSort = val);
                            },
                            items: const [
                              DropdownMenuItem(value: 'DATE', child: Text('Latest Date')),
                              DropdownMenuItem(value: 'ECO', child: Text('Highest Eco Score')),
                              DropdownMenuItem(value: 'DISTANCE', child: Text('Longest Distance')),
                              DropdownMenuItem(value: 'IDLE_COST', child: Text('Highest Idle Cost')),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _buildExportBtn('JSON', Colors.white),
              const SizedBox(width: 8),
              _buildExportBtn('CSV', Colors.white),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildExportBtn(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.download, size: 14, color: color),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              shape: BoxShape.circle,
            ),
            child: const Icon(LucideIcons.calendar, size: 32, color: Colors.white),
          ),
          const SizedBox(height: 16),
          const Text('NO TRIPS RECORDED YET', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 8),
          const Text(
            'Start your first trip to record distance, fuel usage, safety score, eco score, and driving insights.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildTripsList(List<Trip> trips) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: trips.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final trip = trips[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: const Color(0xFF333333)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    DateFormat('E, MMM d').format(DateTime.fromMillisecondsSinceEpoch(trip.startTime)),
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF333333)),
                    ),
                    child: Text(
                      '${(trip.durationSeconds / 60).round()} mins',
                      style: const TextStyle(fontSize: 9, color: Colors.grey),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                trip.title,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF333333)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DISTANCE', style: TextStyle(fontSize: 8, color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text('${trip.distanceKm.toStringAsFixed(1)} km', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF333333)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('IDLE WASTED', style: TextStyle(fontSize: 8, color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text('Rs. ${trip.idleCost.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.only(top: 8),
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: Color(0xFF333333))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 9, color: Colors.grey),
                        children: [
                          const TextSpan(text: 'Total Spend: '),
                          TextSpan(text: 'Rs. ${trip.totalCost.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                    ),
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 9, color: Colors.grey),
                        children: [
                          const TextSpan(text: 'Idle Fuel: '),
                          TextSpan(text: '${trip.idleFuelLiters.toStringAsFixed(2)}L', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.only(top: 12),
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: Color(0xFF333333))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text('ECO: ${trip.ecoScore}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8),
                          child: Text('|', style: TextStyle(color: Colors.grey, fontSize: 10)),
                        ),
                        Text('SAFE: ${trip.safetyScore}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    Row(
                      children: [
                        const Icon(LucideIcons.shieldCheck, size: 12, color: Colors.white),
                        const SizedBox(width: 4),
                        Text('${trip.hardBrakes + trip.hardAccelerations} events', style: const TextStyle(fontSize: 10, color: Colors.white)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
