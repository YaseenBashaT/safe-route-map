const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface WeatherData {
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

function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

function getDrivingCondition(weather: any): { condition: WeatherData['drivingCondition']; advice: string } {
  const code = weather.weather[0]?.id || 800;
  const visibility = weather.visibility / 1000; // km
  const windSpeed = weather.wind?.speed || 0;
  const temp = weather.main?.temp || 20;
  
  // Thunderstorm
  if (code >= 200 && code < 300) {
    return { condition: 'dangerous', advice: '⚠️ SEVERE WEATHER: Thunderstorm detected. Consider postponing travel or drive extremely carefully with hazards on.' };
  }
  
  // Heavy rain/drizzle
  if ((code >= 500 && code < 600) || (code >= 300 && code < 400)) {
    if (code >= 502) {
      return { condition: 'poor', advice: '🌧️ Heavy rain - Reduce speed significantly, increase following distance, and use headlights.' };
    }
    return { condition: 'fair', advice: '🌧️ Light rain - Roads may be slippery. Drive with caution and maintain safe distance.' };
  }
  
  // Snow
  if (code >= 600 && code < 700) {
    return { condition: 'dangerous', advice: '❄️ SNOW CONDITIONS: Roads may be icy. Use winter tires, drive slowly, and avoid sudden movements.' };
  }
  
  // Fog/Mist
  if (code >= 700 && code < 800) {
    if (visibility < 1) {
      return { condition: 'dangerous', advice: '🌫️ DENSE FOG: Visibility very low. Use fog lights, drive very slowly, avoid overtaking.' };
    }
    if (visibility < 5) {
      return { condition: 'poor', advice: '🌫️ Foggy conditions - Reduce speed, use low-beam headlights, keep safe distance.' };
    }
    return { condition: 'fair', advice: '🌫️ Slight haze - Visibility reduced. Stay alert and use headlights.' };
  }
  
  // High winds
  if (windSpeed > 15) {
    return { condition: 'poor', advice: '💨 Strong winds - Drive carefully, especially on bridges and open roads. Avoid overtaking large vehicles.' };
  }
  
  // Extreme temperatures
  if (temp > 42) {
    return { condition: 'fair', advice: '🌡️ Extreme heat - Roads may be softer, tire pressure changes. Stay hydrated and check vehicle cooling.' };
  }
  if (temp < 5) {
    return { condition: 'fair', advice: '🥶 Cold conditions - Watch for ice patches, especially on bridges and shaded areas.' };
  }
  
  // Clear conditions
  if (code === 800 || code === 801) {
    return { condition: 'excellent', advice: '☀️ Excellent driving conditions. Safe travels!' };
  }
  
  return { condition: 'good', advice: '🌤️ Good driving conditions. Stay alert and follow traffic rules.' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, points } = await req.json();
    
    // OpenWeatherMap free API (no key needed for basic forecast)
    const baseUrl = 'https://api.open-meteo.com/v1/forecast';
    
    // If multiple points provided (for route weather)
    if (points && Array.isArray(points)) {
      const weatherResults: WeatherData[] = [];
      
      for (const point of points.slice(0, 5)) { // Max 5 points
        const url = `${baseUrl}?latitude=${point.lat}&longitude=${point.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,visibility&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const data = await response.json();
        const current = data.current;
        
        // Map Open-Meteo weather codes to conditions
        const code = current.weather_code;
        let condition = 'Clear';
        let icon = '☀️';
        
        if (code === 0) { condition = 'Clear'; icon = '☀️'; }
        else if (code <= 3) { condition = 'Partly Cloudy'; icon = '⛅'; }
        else if (code <= 49) { condition = 'Foggy'; icon = '🌫️'; }
        else if (code <= 59) { condition = 'Drizzle'; icon = '🌧️'; }
        else if (code <= 69) { condition = 'Rain'; icon = '🌧️'; }
        else if (code <= 79) { condition = 'Snow'; icon = '❄️'; }
        else if (code <= 84) { condition = 'Rain Showers'; icon = '🌦️'; }
        else if (code <= 94) { condition = 'Snow Showers'; icon = '🌨️'; }
        else { condition = 'Thunderstorm'; icon = '⛈️'; }
        
        const isRainy = code >= 50 && code <= 69;
        const isFoggy = code >= 40 && code <= 49;
        const isStormy = code >= 95;
        
        let drivingCondition: WeatherData['drivingCondition'] = 'excellent';
        let safetyAdvice = '☀️ Excellent driving conditions. Safe travels!';
        
        if (isStormy) {
          drivingCondition = 'dangerous';
          safetyAdvice = '⚠️ SEVERE WEATHER: Storm detected. Consider postponing travel.';
        } else if (code >= 70 && code <= 79) {
          drivingCondition = 'dangerous';
          safetyAdvice = '❄️ SNOW: Roads may be icy. Drive with extreme caution.';
        } else if (isFoggy && (current.visibility || 10000) < 1000) {
          drivingCondition = 'dangerous';
          safetyAdvice = '🌫️ DENSE FOG: Very low visibility. Use fog lights.';
        } else if (isRainy) {
          drivingCondition = code >= 63 ? 'poor' : 'fair';
          safetyAdvice = code >= 63 ? '🌧️ Heavy rain - Reduce speed significantly.' : '🌧️ Light rain - Roads may be slippery.';
        } else if (isFoggy) {
          drivingCondition = 'fair';
          safetyAdvice = '🌫️ Reduced visibility. Use headlights.';
        } else if (current.wind_speed_10m > 50) {
          drivingCondition = 'poor';
          safetyAdvice = '💨 Strong winds - Drive carefully on open roads.';
        } else if (code <= 3) {
          drivingCondition = code === 0 ? 'excellent' : 'good';
          safetyAdvice = '🌤️ Good driving conditions. Stay alert.';
        }
        
        weatherResults.push({
          temperature: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          windDirection: getWindDirection(current.wind_direction_10m || 0),
          condition,
          conditionCode: code,
          icon,
          visibility: (current.visibility || 10000) / 1000,
          uvIndex: 0,
          cloudCover: current.cloud_cover || 0,
          precipitation: current.precipitation || 0,
          isRainy,
          isFoggy,
          isStormy,
          safetyAdvice,
          drivingCondition,
        });
      }
      
      return new Response(
        JSON.stringify({ success: true, data: weatherResults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Single point weather
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ success: false, error: 'Latitude and longitude required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = `${baseUrl}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,visibility&timezone=auto`;
    
    console.log('Fetching weather from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.current;
    
    const code = current.weather_code;
    let condition = 'Clear';
    let icon = '☀️';
    
    if (code === 0) { condition = 'Clear'; icon = '☀️'; }
    else if (code <= 3) { condition = 'Partly Cloudy'; icon = '⛅'; }
    else if (code <= 49) { condition = 'Foggy'; icon = '🌫️'; }
    else if (code <= 59) { condition = 'Drizzle'; icon = '🌧️'; }
    else if (code <= 69) { condition = 'Rain'; icon = '🌧️'; }
    else if (code <= 79) { condition = 'Snow'; icon = '❄️'; }
    else if (code <= 84) { condition = 'Rain Showers'; icon = '🌦️'; }
    else if (code <= 94) { condition = 'Snow Showers'; icon = '🌨️'; }
    else { condition = 'Thunderstorm'; icon = '⛈️'; }
    
    const isRainy = code >= 50 && code <= 69;
    const isFoggy = code >= 40 && code <= 49;
    const isStormy = code >= 95;
    
    let drivingCondition: WeatherData['drivingCondition'] = 'excellent';
    let safetyAdvice = '☀️ Excellent driving conditions. Safe travels!';
    
    if (isStormy) {
      drivingCondition = 'dangerous';
      safetyAdvice = '⚠️ SEVERE WEATHER: Storm detected. Consider postponing travel.';
    } else if (code >= 70 && code <= 79) {
      drivingCondition = 'dangerous';
      safetyAdvice = '❄️ SNOW: Roads may be icy. Drive with extreme caution.';
    } else if (isFoggy && (current.visibility || 10000) < 1000) {
      drivingCondition = 'dangerous';
      safetyAdvice = '🌫️ DENSE FOG: Very low visibility. Use fog lights.';
    } else if (isRainy) {
      drivingCondition = code >= 63 ? 'poor' : 'fair';
      safetyAdvice = code >= 63 ? '🌧️ Heavy rain - Reduce speed significantly.' : '🌧️ Light rain - Roads may be slippery.';
    } else if (isFoggy) {
      drivingCondition = 'fair';
      safetyAdvice = '🌫️ Reduced visibility. Use headlights.';
    } else if (current.wind_speed_10m > 50) {
      drivingCondition = 'poor';
      safetyAdvice = '💨 Strong winds - Drive carefully on open roads.';
    } else if (code <= 3) {
      drivingCondition = code === 0 ? 'excellent' : 'good';
      safetyAdvice = '🌤️ Good driving conditions. Stay alert.';
    }
    
    const weatherData: WeatherData = {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: getWindDirection(current.wind_direction_10m || 0),
      condition,
      conditionCode: code,
      icon,
      visibility: (current.visibility || 10000) / 1000,
      uvIndex: 0,
      cloudCover: current.cloud_cover || 0,
      precipitation: current.precipitation || 0,
      isRainy,
      isFoggy,
      isStormy,
      safetyAdvice,
      drivingCondition,
    };
    
    console.log('Weather data:', weatherData);
    
    return new Response(
      JSON.stringify({ success: true, data: weatherData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Weather error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Weather fetch failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
