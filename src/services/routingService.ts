import { RouteData } from '@/components/RouteResults';
import { RoutePolyline } from '@/components/MapView';
import { AccidentHotspot, calculateRouteRiskScore } from './accidentDataService';

export interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver: string;
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

const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

export interface RouteRiskInfo {
  riskScore: number;
  nearbyHotspots: AccidentHotspot[];
  riskFactors: string[];
}

export interface RoutingResult {
  routes: RouteData[];
  polylines: RoutePolyline[];
  navigationSteps: NavigationStep[][];
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  routeRiskInfo: RouteRiskInfo[];
}

export const fetchRoutes = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  hotspots: AccidentHotspot[] = []
): Promise<RoutingResult> => {
  const coordinates = `${startLng},${startLat};${endLng},${endLat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=true&steps=true`;

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
    isSafest: false, // Will be updated after risk calculation
  }));

  // Calculate risk scores based on nearby hotspots
  const routeRiskInfo: RouteRiskInfo[] = polylines.map((polyline, index) => {
    if (hotspots.length > 0) {
      return calculateRouteRiskScore(polyline.coordinates, hotspots, 10);
    }
    // Fallback to basic calculation if no hotspots
    return {
      riskScore: calculateBasicRiskScore(data.routes[index], index),
      nearbyHotspots: [],
      riskFactors: ['Risk calculated based on route characteristics'],
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

  // Extract navigation steps for each route
  const navigationSteps: NavigationStep[][] = data.routes.map((route) => {
    const steps: NavigationStep[] = [];
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        if (step.distance > 0 || step.maneuver.type === 'arrive') {
          steps.push({
            instruction: formatInstruction(step),
            distance: formatDistance(step.distance),
            duration: formatDuration(step.duration),
            maneuver: getManeuverIcon(step.maneuver.type, step.maneuver.modifier),
          });
        }
      });
    });
    return steps;
  });

  return {
    routes,
    polylines,
    navigationSteps,
    startPoint: { lat: startLat, lng: startLng },
    endPoint: { lat: endLat, lng: endLng },
    routeRiskInfo,
  };
};
