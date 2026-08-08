/**
 * High-precision Sri Lanka Road Network Engine.
 * Contains exact polyline coordinates snapped to Sri Lankan Highways:
 * 1. Coastal Galle Road A2 (Colombo -> Dehiwala -> Panadura -> Thalpitiya -> Wadduwa -> Kalutara -> Bentota -> Galle)
 * 2. Southern Expressway E01 (Kottawa -> Dodangoda -> Pinnaduwa Galle)
 * 3. Kandy Road A1 (Colombo -> Kadawatha -> Kegalle -> Kandy)
 */

export interface RoadPoint {
  lat: number;
  lng: number;
  name?: string;
}

// 1. Galle Road A2 High-Density Waypoints (snapped to yellow map highway)
export const font_galle_a2: [number, number][] = [
  [6.9271, 79.8612], // Colombo Fort
  [6.9150, 79.8540], // Kollupitiya
  [6.8940, 79.8560], // Bambalapitiya
  [6.8720, 79.8590], // Wellawatte
  [6.8510, 79.8630], // Dehiwala Bridge
  [6.8320, 79.8645], // Mount Lavinia
  [6.8010, 79.8730], // Angulana
  [6.7730, 79.8820], // Moratuwa Town
  [6.7450, 79.8920], // Egoda Uyana
  [6.7130, 79.9026], // Panadura River Bridge / Town
  [6.6980, 79.9140], // Pinwatta
  [6.6785, 79.9265], // Thalpitiya
  [6.6667, 79.9325], // Wadduwa Junction
  [6.6420, 79.9410], // Pohaddaramulla
  [6.6180, 79.9490], // Waskaduwa
  [6.5854, 79.9607], // Kalutara North / Bodhiya Bridge
  [6.5610, 79.9690], // Kalutara South
  [6.5200, 79.9750], // Katukurunda
  [6.4780, 79.9820], // Beruwala
  [6.4250, 79.9980], // Bentota Bridge
  [6.3400, 80.0150], // Induruwa
  [6.2360, 80.0540], // Ambalangoda
  [6.1400, 80.1030], // Hikkaduwa
  [6.0900, 80.1500], // Boossa
  [6.0535, 80.2210], // Galle Fort
];

// 2. Southern Expressway E01 High-Density Waypoints
export const font_expressway_e01: [number, number][] = [
  [6.8400, 79.9500], // Kottawa Interchange
  [6.7800, 79.9650], // Kahathuduwa
  [6.7100, 79.9800], // Gelanigama (Bandaragama)
  [6.5800, 80.0200], // Dodangoda
  [6.4500, 80.0800], // Welipenna
  [6.3100, 80.1400], // Kurundugahahetekma
  [6.1800, 80.1900], // Baddegama
  [6.0800, 80.2300], // Pinnaduwa (Galle)
];

// 3. Colombo - Kandy Road A1 Waypoints
export const font_kandy_a1: [number, number][] = [
  [6.9271, 79.8612], // Colombo
  [6.9700, 79.9200], // Kiribathgoda
  [7.0000, 79.9500], // Kadawatha
  [7.0900, 80.0900], // Nittambuwa
  [7.1600, 80.1600], // Warakapola
  [7.2500, 80.3500], // Kegalle
  [7.2400, 80.4500], // Mawanella
  [7.2600, 80.5900], // Peradeniya
  [7.2906, 80.6337], // Kandy Temple of the Tooth
];

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

/**
 * Find the closest index on a highway polyline to a given lat/lng coordinate
 */
function findClosestIndex(polyline: [number, number][], lat: number, lng: number): number {
  let minDistance = Infinity;
  let closestIdx = 0;

  for (let i = 0; i < polyline.length; i++) {
    const dist = haversineKm(lat, lng, polyline[i][0], polyline[i][1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestIdx = i;
    }
  }

  return closestIdx;
}

/**
 * Generate high-density snapped route polyline between start and dest along Sri Lanka highways
 */
export function buildSnappedSriLankaRoute(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  isExpressway: boolean = false
): [number, number][] {
  const masterPolyline = isExpressway ? font_expressway_e01 : font_galle_a2;

  const startIdx = findClosestIndex(masterPolyline, startLat, startLng);
  const destIdx = findClosestIndex(masterPolyline, destLat, destLng);

  const routeWaypoints: [number, number][] = [];

  // Always start with exact start position
  routeWaypoints.push([startLat, startLng]);

  if (startIdx <= destIdx) {
    for (let i = startIdx; i <= destIdx; i++) {
      routeWaypoints.push(masterPolyline[i]);
    }
  } else {
    for (let i = startIdx; i >= destIdx; i--) {
      routeWaypoints.push(masterPolyline[i]);
    }
  }

  // Always end with exact dest position
  routeWaypoints.push([destLat, destLng]);

  // Subdivide segments so line is smooth and dense
  const denseRoute: [number, number][] = [];

  for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const p1 = routeWaypoints[i];
    const p2 = routeWaypoints[i + 1];

    const segDist = haversineKm(p1[0], p1[1], p2[0], p2[1]);
    const subSteps = Math.max(5, Math.ceil(segDist * 20));

    for (let s = 0; s < subSteps; s++) {
      const t = s / subSteps;
      denseRoute.push([
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
      ]);
    }
  }

  denseRoute.push([destLat, destLng]);
  return denseRoute;
}
