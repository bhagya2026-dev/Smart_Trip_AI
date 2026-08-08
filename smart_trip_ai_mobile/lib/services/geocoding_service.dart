import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import '../domain/models/destination.dart';

// Cache for live geocoded results
final Map<String, List<Destination>> _geocodeCache = {};

/// Live geocoding search for ANY location, street, town, hotel or landmark in Sri Lanka using OpenStreetMap Nominatim API.
Future<List<Destination>> searchSriLankaLocations(String query,
    {double currentLat = 6.9271, double currentLng = 79.8612}) async {
  final trimmed = query.trim();
  if (trimmed.isEmpty || trimmed.length < 2) return [];

  final cacheKey = trimmed.toLowerCase();
  if (_geocodeCache.containsKey(cacheKey)) {
    return _geocodeCache[cacheKey]!;
  }

  try {
    final queryUrl = Uri.parse(
        'https://nominatim.openstreetmap.org/search?format=json&q=${Uri.encodeComponent('$trimmed, Sri Lanka')}&countrycodes=lk&limit=8');
    final response = await http.get(queryUrl, headers: {
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'SmartTripAI Telematics App (Sri Lanka)',
    });

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      final List<Destination> results = [];

      for (int i = 0; i < data.length; i++) {
        final item = data[i];
        final lat = double.parse(item['lat'].toString());
        final lon = double.parse(item['lon'].toString());
        
        final nameParts = item['display_name'].toString().split(',');
        final mainName = nameParts.isNotEmpty ? nameParts[0].trim() : item['display_name'];
        final cityName = nameParts.length > 1 
          ? nameParts[1].trim() 
          : (nameParts.length > 2 ? nameParts[2].trim() : 'Sri Lanka');

        // Calculate Haversine distance from current position
        final distKm = _calculateDistanceKm(currentLat, currentLng, lat, lon);

        results.add(Destination(
          id: 'geo-$i-${DateTime.now().millisecondsSinceEpoch}',
          name: mainName,
          city: cityName,
          latitude: lat,
          longitude: lon,
          distanceKmEst: double.parse(distKm.toStringAsFixed(1)),
        ));
      }

      _geocodeCache[cacheKey] = results;
      return results;
    }
  } catch (error) {
    print('Live geocoding search error: $error');
  }

  return [];
}

double _calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
  const r = 6371.0;
  final dLat = ((lat2 - lat1) * pi) / 180;
  final dLon = ((lon2 - lon1) * pi) / 180;
  final a = sin(dLat / 2) * sin(dLat / 2) +
      cos((lat1 * pi) / 180) *
          cos((lat2 * pi) / 180) *
          sin(dLon / 2) *
          sin(dLon / 2);
  final c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return r * c;
}
