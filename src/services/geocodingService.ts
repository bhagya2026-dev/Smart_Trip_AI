import type { Destination } from '../presentation/components/DestinationSearchBar';

// Cache for live geocoded results
const geocodeCache = new Map<string, Destination[]>();

/**
 * Live geocoding search for ANY location, street, town, hotel or landmark in Sri Lanka using OpenStreetMap Nominatim API.
 */
export async function searchSriLankaLocations(query: string, currentLat: number = 6.9271, currentLng: number = 79.8612): Promise<Destination[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ', Sri Lanka')}&countrycodes=lk&limit=8`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'SmartTripAI Telematics App (Sri Lanka)',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const results: Destination[] = data.map((item: any, idx: number) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const nameParts = item.display_name.split(',');
        const mainName = nameParts[0]?.trim() || item.display_name;
        const cityName = nameParts[1]?.trim() || nameParts[2]?.trim() || 'Sri Lanka';

        // Calculate Haversine distance from current position
        const distKm = calculateDistanceKm(currentLat, currentLng, lat, lon);

        return {
          id: `geo-${idx}-${Date.now()}`,
          name: mainName,
          city: cityName,
          latitude: lat,
          longitude: lon,
          distanceKmEst: parseFloat(distKm.toFixed(1)),
        };
      });

      geocodeCache.set(cacheKey, results);
      return results;
    }
  } catch (error) {
    console.warn('Live geocoding search error:', error);
  }

  return [];
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
