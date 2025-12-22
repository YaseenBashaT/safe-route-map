import { RouteData } from '@/components/RouteResults';
import { RoutePolyline } from '@/components/MapView';

interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][]; // [lng, lat] format
  };
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
}

// Calculate risk score based on route characteristics
// In production, this would use actual accident data
const calculateRiskScore = (route: OSRMRoute, index: number): number => {
  // Simplified risk calculation based on distance and duration
  // Longer routes through highways = potentially safer (less urban traffic)
  const avgSpeed = route.distance / route.duration; // m/s
  const baseRisk = 50;
  
  // Higher average speed suggests highway = lower urban accident risk
  const speedFactor = avgSpeed > 15 ? -15 : avgSpeed > 10 ? 0 : 15;
  
  // Add some variation based on route index
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

export interface RoutingResult {
  routes: RouteData[];
  polylines: RoutePolyline[];
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
}

export const fetchRoutes = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RoutingResult> => {
  // OSRM uses lng,lat format
  const coordinates = `${startLng},${startLat};${endLng},${endLat}`;
  
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=true`;
  
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
  
  // Process routes and calculate risk scores
  const routesWithRisk = data.routes.map((route, index) => ({
    route,
    riskScore: calculateRiskScore(route, index),
  }));
  
  // Find the safest route index
  const safestIndex = routesWithRisk.reduce(
    (minIdx, { riskScore }, idx, arr) => 
      riskScore < arr[minIdx].riskScore ? idx : minIdx,
    0
  );
  
  const routes: RouteData[] = routesWithRisk.map(({ route, riskScore }, index) => ({
    id: index + 1,
    distance: formatDistance(route.distance),
    eta: formatDuration(route.duration),
    riskScore,
  }));
  
  const polylines: RoutePolyline[] = data.routes.map((route, index) => ({
    // OSRM returns [lng, lat], Leaflet needs [lat, lng]
    coordinates: route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    ),
    isSafest: index === safestIndex,
  }));
  
  return {
    routes,
    polylines,
    startPoint: { lat: startLat, lng: startLng },
    endPoint: { lat: endLat, lng: endLng },
  };
};
