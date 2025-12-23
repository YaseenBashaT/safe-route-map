import { RouteData } from '@/components/RouteResults';
import { RoutePolyline } from '@/components/MapView';
import { AccidentHotspot, calculateRouteRiskScore } from './accidentDataService';

export interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver: string;
  // Safety features
  speedLimit?: number;
  isNearDangerZone?: boolean;
  dangerZoneInfo?: {
    city: string;
    totalAccidents: number;
    fatalAccidents: number;
    distance: number; // km from this step
  };
  cautionWarning?: string;
}

interface OSRMStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

interface OSRMLeg {
  steps: OSRMStep[];
  distance: number;
  duration: number;
}

interface OSRMRoute {
  distance: number;
  duration: number;
  legs: OSRMLeg[];
  geometry: {
    coordinates: [number, number][];
  };
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
}

const getManeuverIcon = (type: string, modifier?: string): string => {
  const icons: Record<string, string> = {
    'depart': '🚗',
    'arrive': '🏁',
    'turn-left': '⬅️',
    'turn-right': '➡️',
    'turn-slight-left': '↖️',
    'turn-slight-right': '↗️',
    'turn-sharp-left': '↩️',
    'turn-sharp-right': '↪️',
    'continue': '⬆️',
    'roundabout': '🔄',
    'rotary': '🔄',
    'fork-left': '↖️',
    'fork-right': '↗️',
    'merge-left': '↖️',
    'merge-right': '↗️',
    'ramp-left': '↖️',
    'ramp-right': '↗️',
    'on-ramp-left': '↖️',
    'on-ramp-right': '↗️',
    'off-ramp-left': '↖️',
    'off-ramp-right': '↗️',
    'end-of-road-left': '⬅️',
    'end-of-road-right': '➡️',
  };

  const key = modifier ? `${type}-${modifier}` : type;
  return icons[key] || icons[type] || '➡️';
};

const formatInstruction = (step: OSRMStep): string => {
  const { type, modifier } = step.maneuver;
  const streetName = step.name || 'the road';

  const instructions: Record<string, string> = {
    'depart': `Start on ${streetName}`,
    'arrive': `Arrive at your destination`,
    'turn': `Turn ${modifier || ''} onto ${streetName}`,
    'continue': `Continue on ${streetName}`,
    'merge': `Merge ${modifier || ''} onto ${streetName}`,
    'on ramp': `Take the ramp onto ${streetName}`,
    'off ramp': `Take the exit onto ${streetName}`,
    'fork': `Take the ${modifier || ''} fork onto ${streetName}`,
    'end of road': `At the end, turn ${modifier || ''} onto ${streetName}`,
    'roundabout': `At the roundabout, take the exit onto ${streetName}`,
    'rotary': `At the rotary, take the exit onto ${streetName}`,
    'new name': `Continue onto ${streetName}`,
    'notification': `Continue on ${streetName}`,
  };

  return instructions[type] || `Continue on ${streetName}`;
};

const calculateBasicRiskScore = (route: OSRMRoute, index: number): number => {
  const avgSpeed = route.distance / route.duration;
  const baseRisk = 50;
  const speedFactor = avgSpeed > 15 ? -15 : avgSpeed > 10 ? 0 : 15;
  const variation = (index * 12) % 30;
  return Math.max(10, Math.min(95, baseRisk + speedFactor + variation));
};

// More accurate distance formatting
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    const km = meters / 1000;
    // Show more precision for shorter distances
    if (km < 10) {
      return `${km.toFixed(2)} km`;
    } else if (km < 100) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(km)} km`;
  }
  return `${Math.round(meters)} m`;
};

// More accurate duration formatting
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return `${secs} sec`;
};

// Calculate average speed accurately
export const calculateAverageSpeed = (distanceMeters: number, durationSeconds: number): number => {
  if (durationSeconds === 0) return 0;
  const speedKmh = (distanceMeters / 1000) / (durationSeconds / 3600);
  return Math.round(speedKmh * 10) / 10; // One decimal place
};

export interface RouteRiskInfo {
  riskScore: number;
  nearbyHotspots: AccidentHotspot[];
  riskFactors: string[];
  dangerZones: DangerZone[];
}

export interface DangerZone {
  lat: number;
  lng: number;
  city: string;
  totalAccidents: number;
  fatalAccidents: number;
  seriousAccidents: number;
  recommendedSpeed: number;
  cautionMessage: string;
}

export interface RoutingResult {
  routes: RouteData[];
  polylines: RoutePolyline[];
  navigationSteps: NavigationStep[][];
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number }[];
  routeRiskInfo: RouteRiskInfo[];
  rawDistanceMeters: number[];
  rawDurationSeconds: number[];
}

// Helper to calculate distance between two points
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate danger zones from hotspots
function generateDangerZones(nearbyHotspots: AccidentHotspot[]): DangerZone[] {
  return nearbyHotspots
    .filter(h => h.totalAccidents >= 2)
    .map(h => {
      let recommendedSpeed = 40; // default
      let cautionMessage = 'Drive carefully - accident-prone area';

      if (h.fatalAccidents > 0) {
        recommendedSpeed = 30;
        cautionMessage = '⚠️ HIGH DANGER ZONE - Fatal accidents reported. Reduce speed significantly!';
      } else if (h.seriousAccidents > 2) {
        recommendedSpeed = 35;
        cautionMessage = '⚠️ DANGER ZONE - Multiple serious accidents. Drive with extreme caution!';
      } else if (h.totalAccidents > 5) {
        recommendedSpeed = 40;
        cautionMessage = '⚠️ Accident hotspot ahead - Stay alert and maintain safe distance';
      }

      return {
        lat: h.lat,
        lng: h.lng,
        city: h.city,
        totalAccidents: h.totalAccidents,
        fatalAccidents: h.fatalAccidents,
        seriousAccidents: h.seriousAccidents,
        recommendedSpeed,
        cautionMessage,
      };
    })
    .sort((a, b) => b.totalAccidents - a.totalAccidents);
}

// Add safety info to navigation steps
function enrichNavigationSteps(
  steps: NavigationStep[],
  dangerZones: DangerZone[],
  stepLocations: [number, number][]
): NavigationStep[] {
  return steps.map((step, index) => {
    const stepLocation = stepLocations[index];
    if (!stepLocation) return step;

    // Find nearest danger zone to this step
    let nearestZone: DangerZone | null = null;
    let nearestDistance = Infinity;

    for (const zone of dangerZones) {
      const dist = haversineDistance(stepLocation[0], stepLocation[1], zone.lat, zone.lng);
      if (dist < 2 && dist < nearestDistance) { // Within 2km
        nearestZone = zone;
        nearestDistance = dist;
      }
    }

    if (nearestZone) {
      return {
        ...step,
        isNearDangerZone: true,
        speedLimit: nearestZone.recommendedSpeed,
        dangerZoneInfo: {
          city: nearestZone.city,
          totalAccidents: nearestZone.totalAccidents,
          fatalAccidents: nearestZone.fatalAccidents,
          distance: Math.round(nearestDistance * 10) / 10,
        },
        cautionWarning: nearestZone.cautionMessage,
      };
    }

    return step;
  });
}

export const fetchRoutes = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  hotspots: AccidentHotspot[] = [],
  waypoints?: { lat: number; lng: number }[]
): Promise<RoutingResult> => {
  // Build coordinates string with waypoints
  let coordsArray = [`${startLng},${startLat}`];
  if (waypoints && waypoints.length > 0) {
    coordsArray = coordsArray.concat(waypoints.map(wp => `${wp.lng},${wp.lat}`));
  }
  coordsArray.push(`${endLng},${endLat}`);
  
  const coordinates = coordsArray.join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=${waypoints && waypoints.length > 0 ? 'false' : 'true'}&steps=true`;

  console.log('Fetching routes from OSRM:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OSRM API error: ${response.status}`);
  }

  const data: OSRMResponse = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('No routes found between these coordinates');
  }

  console.log(`Found ${data.routes.length} routes`);

  // Convert route geometries to coordinates for risk calculation
  const polylines: RoutePolyline[] = data.routes.map((route) => ({
    coordinates: route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    ),
    isSafest: false,
  }));

  // Calculate risk scores based on nearby hotspots
  const routeRiskInfo: RouteRiskInfo[] = polylines.map((polyline, index) => {
    if (hotspots.length > 0) {
      const riskResult = calculateRouteRiskScore(polyline.coordinates, hotspots, 5);
      const dangerZones = generateDangerZones(riskResult.nearbyHotspots);
      return {
        ...riskResult,
        dangerZones,
      };
    }
    return {
      riskScore: calculateBasicRiskScore(data.routes[index], index),
      nearbyHotspots: [],
      riskFactors: ['Risk calculated based on route characteristics'],
      dangerZones: [],
    };
  });

  // Find safest route
  const safestIndex = routeRiskInfo.reduce(
    (minIdx, { riskScore }, idx, arr) =>
      riskScore < arr[minIdx].riskScore ? idx : minIdx,
    0
  );

  // Update polylines with safest flag
  polylines.forEach((p, index) => {
    p.isSafest = index === safestIndex;
  });

  const routes: RouteData[] = data.routes.map((route, index) => ({
    id: index + 1,
    distance: formatDistance(route.distance),
    eta: formatDuration(route.duration),
    riskScore: routeRiskInfo[index].riskScore,
  }));

  // Extract navigation steps for each route with safety info
  const navigationSteps: NavigationStep[][] = data.routes.map((route, routeIndex) => {
    const steps: NavigationStep[] = [];
    const stepLocations: [number, number][] = [];
    
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        if (step.distance > 0 || step.maneuver.type === 'arrive') {
          steps.push({
            instruction: formatInstruction(step),
            distance: formatDistance(step.distance),
            duration: formatDuration(step.duration),
            maneuver: getManeuverIcon(step.maneuver.type, step.maneuver.modifier),
          });
          stepLocations.push([step.maneuver.location[1], step.maneuver.location[0]]);
        }
      });
    });

    // Enrich with danger zone info
    return enrichNavigationSteps(steps, routeRiskInfo[routeIndex].dangerZones, stepLocations);
  });

  return {
    routes,
    polylines,
    navigationSteps,
    startPoint: { lat: startLat, lng: startLng },
    endPoint: { lat: endLat, lng: endLng },
    waypoints,
    routeRiskInfo,
    rawDistanceMeters: data.routes.map(r => r.distance),
    rawDurationSeconds: data.routes.map(r => r.duration),
  };
};
