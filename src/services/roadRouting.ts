import { buildSnappedSriLankaRoute } from './sriLankaRoadNetwork';

export interface RouteOption {
  id: string;
  name: string;
  via: string;
  type: 'COASTAL' | 'EXPRESSWAY' | 'STANDARD';
  distanceKm: number;
  durationMins: number;
  coordinates: [number, number][];
}

const routeCache = new Map<string, RouteOption[]>();

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export async function fetchMultiRoadRoutes(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  destinationName: string = ''
): Promise<RouteOption[]> {
  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${destLat.toFixed(4)},${destLng.toFixed(4)}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const directDistance = haversineKm(startLat, startLng, destLat, destLng);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const routeOptions: RouteOption[] = data.routes.slice(0, 2).map((r: any, idx: number) => {
          const coords: [number, number][] = r.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          const distanceKm = parseFloat((r.distance / 1000).toFixed(1));
          const durationMins = Math.max(1, Math.round(r.duration / 60));

          let routeName = idx === 0 ? 'Galle Road A2 Main Highway' : 'Scenic Coastal Route';
          let via = 'Galle Road A2';
          let routeType: RouteOption['type'] = 'COASTAL';

          if (destinationName.toLowerCase().includes('galle') || destLat < 6.2) {
            if (idx === 0) {
              routeName = 'Expressway Route (E01)';
              via = 'Southern Expressway (Toll)';
              routeType = 'EXPRESSWAY';
            } else {
              routeName = 'Coastal Route (Galle Road A2)';
              via = 'Galle Road (Coastal)';
              routeType = 'COASTAL';
            }
          }

          return {
            id: `route-${idx}`,
            name: routeName,
            via,
            type: routeType,
            distanceKm,
            durationMins,
            coordinates: coords,
          };
        });

        routeCache.set(cacheKey, routeOptions);
        return routeOptions;
      }
    }
  } catch (error) {
    console.warn('Multi-route fetch fallback:', error);
  }

  // Snapped Galle Road A2 highway corridor fallback
  const snappedGalleA2Coords = buildSnappedSriLankaRoute(startLat, startLng, destLat, destLng, false);
  const snappedExpresswayCoords = buildSnappedSriLankaRoute(startLat, startLng, destLat, destLng, true);

  const routeDist = parseFloat((directDistance * 1.10).toFixed(1));
  const routeDuration = Math.max(2, Math.round(routeDist * 1.5));

  const fallbacks: RouteOption[] = [
    {
      id: 'route-0',
      name: 'Galle Road A2 Main Highway',
      via: 'Galle Road A2',
      type: 'COASTAL',
      distanceKm: routeDist,
      durationMins: routeDuration,
      coordinates: snappedGalleA2Coords,
    },
  ];

  if (destinationName.toLowerCase().includes('galle') || destLat < 6.2) {
    fallbacks.push({
      id: 'route-1',
      name: 'Expressway Route (E01)',
      via: 'Southern Expressway E01',
      type: 'EXPRESSWAY',
      distanceKm: parseFloat((routeDist * 1.05).toFixed(1)),
      durationMins: Math.max(2, Math.round(routeDuration * 0.6)),
      coordinates: snappedExpresswayCoords,
    });
  }

  routeCache.set(cacheKey, fallbacks);
  return fallbacks;
}
