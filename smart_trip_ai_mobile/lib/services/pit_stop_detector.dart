import '../domain/models/telemetry.dart';
import 'fuel_engine.dart';

class CategoryTag {
  final PitStopCategory category;
  final String name;
  final List<String> keywords;

  CategoryTag(this.category, this.name, this.keywords);
}

final List<CategoryTag> categoryTags = [
  CategoryTag(PitStopCategory.coffeeShop, 'Starbucks / Coffee Haven', ['coffee', 'cafe', 'bistro']),
  CategoryTag(PitStopCategory.gasStation, 'Shell / Energy Station', ['fuel', 'gas', 'shell', 'bp']),
  CategoryTag(PitStopCategory.restArea, 'Highway Rest Stop', ['rest', 'highway', 'plaza']),
  CategoryTag(PitStopCategory.clientSite, 'Downtown Tech Hub', ['office', 'tech', 'building']),
  CategoryTag(PitStopCategory.parking, 'Central Parking Garage', ['parking', 'garage', 'lot']),
  CategoryTag(PitStopCategory.trafficHold, 'Severe Traffic Jam', ['traffic', 'jam', 'signal']),
];

class PitStopDetector {
  PitStop? _activeStop;
  final FuelEngine _fuelEngine;

  PitStopDetector(this._fuelEngine);

  /// Process state change and point to detect and manage PitStops.
  PitStop? evaluatePoint(TelemetryPoint point, String previousState) {
    final isStopState = point.state == DrivingState.pitStop || point.state == DrivingState.idling;

    if (isStopState) {
      if (_activeStop == null) {
        // Initialize a new Pit-Stop cluster candidate
        final categoryMatch = predictCategory(point);
        _activeStop = PitStop(
          id: 'stop-${DateTime.now().millisecondsSinceEpoch}',
          tripId: point.tripId,
          startTime: point.timestamp,
          latitude: point.latitude,
          longitude: point.longitude,
          category: categoryMatch.category,
          name: categoryMatch.name,
          address: '${point.latitude.toStringAsFixed(4)}° N, ${point.longitude.toStringAsFixed(4)}° W',
          idleFuelCost: 0,
          idleFuelLiters: 0,
          durationSeconds: 0,
        );
      } else {
        // Update ongoing stop duration & fuel cost
        final startTime = _activeStop!.startTime;
        final durationSec = ((point.timestamp - startTime) / 1000).round();
        final fuelWaste = _fuelEngine.calculateIdleWaste(durationSec);

        _activeStop = PitStop(
          id: _activeStop!.id,
          tripId: _activeStop!.tripId,
          startTime: _activeStop!.startTime,
          latitude: _activeStop!.latitude,
          longitude: _activeStop!.longitude,
          category: _activeStop!.category,
          name: _activeStop!.name,
          address: _activeStop!.address,
          durationSeconds: durationSec,
          idleFuelLiters: fuelWaste.idleLiters,
          idleFuelCost: fuelWaste.idleCost,
        );
      }
    } else if (previousState == 'PIT_STOP' || previousState == 'IDLING') {
      // Vehicle resumed movement -> Close and finalize pit stop
      if (_activeStop != null && _activeStop!.durationSeconds >= 30) {
        final completedStop = PitStop(
          id: _activeStop!.id,
          tripId: _activeStop!.tripId,
          startTime: _activeStop!.startTime,
          endTime: point.timestamp,
          latitude: _activeStop!.latitude,
          longitude: _activeStop!.longitude,
          category: _activeStop!.category,
          name: _activeStop!.name,
          address: _activeStop!.address,
          durationSeconds: _activeStop!.durationSeconds,
          idleFuelLiters: _activeStop!.idleFuelLiters,
          idleFuelCost: _activeStop!.idleFuelCost,
        );
        _activeStop = null;
        return completedStop;
      }
      _activeStop = null;
    }

    return null;
  }

  PitStop? getActiveStop() {
    return _activeStop;
  }

  CategoryTag predictCategory(TelemetryPoint point) {
    // Spatial deterministic pseudo-picker for realistic demo stopping tags based on coords
    final latHash = (point.latitude * 1000).floor().abs() % categoryTags.length;
    return categoryTags[latHash];
  }

  void reset() {
    _activeStop = null;
  }
}
