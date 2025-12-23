import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  conditionCode: number;
  icon: string;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  precipitation: number;
  isRainy: boolean;
  isFoggy: boolean;
  isStormy: boolean;
  safetyAdvice: string;
  drivingCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
}

export interface RouteWeatherPoint {
  lat: number;
  lng: number;
  weather: WeatherData;
  distanceFromStart: number; // km
}

// Fetch weather for current location
export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const { data, error } = await supabase.functions.invoke('weather', {
      body: { lat, lng }
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Failed to fetch weather');

    return data.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// Fetch weather along a route at key points
export async function fetchRouteWeather(
  routeCoords: [number, number][],
  numPoints: number = 5
): Promise<RouteWeatherPoint[]> {
  try {
    if (routeCoords.length < 2) return [];

    // Select evenly distributed points along the route
    const totalDistance = calculateTotalDistance(routeCoords);
    const interval = totalDistance / (numPoints - 1);
    const points: { lat: number; lng: number; distance: number }[] = [];
    
    let accumulatedDistance = 0;
    let pointIndex = 0;
    
    // Always include start
    points.push({ lat: routeCoords[0][0], lng: routeCoords[0][1], distance: 0 });
    
    for (let i = 1; i < routeCoords.length && points.length < numPoints - 1; i++) {
      const segmentDist = haversineDistance(
        routeCoords[i - 1][0], routeCoords[i - 1][1],
        routeCoords[i][0], routeCoords[i][1]
      );
      accumulatedDistance += segmentDist;
      
      while (accumulatedDistance >= (pointIndex + 1) * interval && points.length < numPoints - 1) {
        pointIndex++;
        points.push({
          lat: routeCoords[i][0],
          lng: routeCoords[i][1],
          distance: accumulatedDistance
        });
      }
    }
    
    // Always include end
    const lastCoord = routeCoords[routeCoords.length - 1];
    points.push({ lat: lastCoord[0], lng: lastCoord[1], distance: totalDistance });

    const { data, error } = await supabase.functions.invoke('weather', {
      body: { points: points.map(p => ({ lat: p.lat, lng: p.lng })) }
    });

    if (error) throw error;
    if (!data?.success || !data.data) return [];

    return points.map((point, index) => ({
      lat: point.lat,
      lng: point.lng,
      weather: data.data[index],
      distanceFromStart: Math.round(point.distance * 10) / 10
    })).filter(p => p.weather);
  } catch (error) {
    console.error('Error fetching route weather:', error);
    return [];
  }
}

// Get overall route weather assessment
export function assessRouteWeatherSafety(weatherPoints: RouteWeatherPoint[]): {
  overallCondition: WeatherData['drivingCondition'];
  worstCondition: WeatherData['drivingCondition'];
  recommendation: string;
  alerts: string[];
} {
  if (weatherPoints.length === 0) {
    return {
      overallCondition: 'good',
      worstCondition: 'good',
      recommendation: 'Weather data unavailable. Check local conditions before traveling.',
      alerts: []
    };
  }

  const conditionRanks: Record<WeatherData['drivingCondition'], number> = {
    'excellent': 5,
    'good': 4,
    'fair': 3,
    'poor': 2,
    'dangerous': 1
  };

  let worstRank = 5;
  let totalRank = 0;
  const alerts: string[] = [];

  weatherPoints.forEach((point, index) => {
    const rank = conditionRanks[point.weather.drivingCondition];
    totalRank += rank;
    if (rank < worstRank) worstRank = rank;

    if (point.weather.drivingCondition === 'dangerous') {
      alerts.push(`⚠️ Dangerous conditions at ${point.distanceFromStart}km: ${point.weather.condition}`);
    } else if (point.weather.drivingCondition === 'poor') {
      alerts.push(`⚡ Poor conditions at ${point.distanceFromStart}km: ${point.weather.condition}`);
    }
  });

  const avgRank = totalRank / weatherPoints.length;
  let overallCondition: WeatherData['drivingCondition'] = 'good';
  if (avgRank >= 4.5) overallCondition = 'excellent';
  else if (avgRank >= 3.5) overallCondition = 'good';
  else if (avgRank >= 2.5) overallCondition = 'fair';
  else if (avgRank >= 1.5) overallCondition = 'poor';
  else overallCondition = 'dangerous';

  const worstCondition = Object.entries(conditionRanks).find(([_, r]) => r === worstRank)?.[0] as WeatherData['drivingCondition'] || 'good';

  let recommendation = '';
  if (worstCondition === 'dangerous') {
    recommendation = '🚫 TRAVEL NOT RECOMMENDED: Severe weather conditions along the route. Consider postponing your trip.';
  } else if (worstCondition === 'poor') {
    recommendation = '⚠️ CAUTION ADVISED: Poor weather conditions ahead. Allow extra travel time and drive carefully.';
  } else if (worstCondition === 'fair') {
    recommendation = '🟡 MODERATE CONDITIONS: Some areas may have reduced visibility or wet roads. Stay alert.';
  } else {
    recommendation = '✅ SAFE TO TRAVEL: Weather conditions are favorable for your journey.';
  }

  return {
    overallCondition,
    worstCondition,
    recommendation,
    alerts
  };
}

// Helper functions
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTotalDistance(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
  }
  return total;
}
