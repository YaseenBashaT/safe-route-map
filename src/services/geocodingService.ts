export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// Common Indian city shortcuts for faster search
const popularCities: Record<string, { name: string; lat: string; lon: string; display: string }> = {
  'delhi': { name: 'Delhi', lat: '28.6139', lon: '77.2090', display: 'Delhi, India' },
  'mumbai': { name: 'Mumbai', lat: '19.0760', lon: '72.8777', display: 'Mumbai, Maharashtra, India' },
  'bangalore': { name: 'Bangalore', lat: '12.9716', lon: '77.5946', display: 'Bangalore, Karnataka, India' },
  'bengaluru': { name: 'Bengaluru', lat: '12.9716', lon: '77.5946', display: 'Bengaluru, Karnataka, India' },
  'chennai': { name: 'Chennai', lat: '13.0827', lon: '80.2707', display: 'Chennai, Tamil Nadu, India' },
  'kolkata': { name: 'Kolkata', lat: '22.5726', lon: '88.3639', display: 'Kolkata, West Bengal, India' },
  'hyderabad': { name: 'Hyderabad', lat: '17.3850', lon: '78.4867', display: 'Hyderabad, Telangana, India' },
  'pune': { name: 'Pune', lat: '18.5204', lon: '73.8567', display: 'Pune, Maharashtra, India' },
  'ahmedabad': { name: 'Ahmedabad', lat: '23.0225', lon: '72.5714', display: 'Ahmedabad, Gujarat, India' },
  'jaipur': { name: 'Jaipur', lat: '26.9124', lon: '75.7873', display: 'Jaipur, Rajasthan, India' },
  'lucknow': { name: 'Lucknow', lat: '26.8467', lon: '80.9462', display: 'Lucknow, Uttar Pradesh, India' },
  'kanpur': { name: 'Kanpur', lat: '26.4499', lon: '80.3319', display: 'Kanpur, Uttar Pradesh, India' },
  'nagpur': { name: 'Nagpur', lat: '21.1458', lon: '79.0882', display: 'Nagpur, Maharashtra, India' },
  'visakhapatnam': { name: 'Visakhapatnam', lat: '17.6868', lon: '83.2185', display: 'Visakhapatnam, Andhra Pradesh, India' },
  'vizag': { name: 'Visakhapatnam', lat: '17.6868', lon: '83.2185', display: 'Visakhapatnam, Andhra Pradesh, India' },
  'bhopal': { name: 'Bhopal', lat: '23.2599', lon: '77.4126', display: 'Bhopal, Madhya Pradesh, India' },
  'patna': { name: 'Patna', lat: '25.5941', lon: '85.1376', display: 'Patna, Bihar, India' },
  'indore': { name: 'Indore', lat: '22.7196', lon: '75.8577', display: 'Indore, Madhya Pradesh, India' },
  'vadodara': { name: 'Vadodara', lat: '22.3072', lon: '73.1812', display: 'Vadodara, Gujarat, India' },
  'surat': { name: 'Surat', lat: '21.1702', lon: '72.8311', display: 'Surat, Gujarat, India' },
  'coimbatore': { name: 'Coimbatore', lat: '11.0168', lon: '76.9558', display: 'Coimbatore, Tamil Nadu, India' },
  'kochi': { name: 'Kochi', lat: '9.9312', lon: '76.2673', display: 'Kochi, Kerala, India' },
  'cochin': { name: 'Kochi', lat: '9.9312', lon: '76.2673', display: 'Kochi, Kerala, India' },
  'vijayawada': { name: 'Vijayawada', lat: '16.5062', lon: '80.6480', display: 'Vijayawada, Andhra Pradesh, India' },
  'madurai': { name: 'Madurai', lat: '9.9252', lon: '78.1198', display: 'Madurai, Tamil Nadu, India' },
  'varanasi': { name: 'Varanasi', lat: '25.3176', lon: '82.9739', display: 'Varanasi, Uttar Pradesh, India' },
  'agra': { name: 'Agra', lat: '27.1767', lon: '78.0081', display: 'Agra, Uttar Pradesh, India' },
  'chandigarh': { name: 'Chandigarh', lat: '30.7333', lon: '76.7794', display: 'Chandigarh, India' },
  'guwahati': { name: 'Guwahati', lat: '26.1445', lon: '91.7362', display: 'Guwahati, Assam, India' },
  'thiruvananthapuram': { name: 'Thiruvananthapuram', lat: '8.5241', lon: '76.9366', display: 'Thiruvananthapuram, Kerala, India' },
  'trivandrum': { name: 'Thiruvananthapuram', lat: '8.5241', lon: '76.9366', display: 'Thiruvananthapuram, Kerala, India' },
};

export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  
  // Check for quick matches in popular cities
  const quickMatches: NominatimResult[] = [];
  for (const [key, city] of Object.entries(popularCities)) {
    if (key.startsWith(normalizedQuery) || city.name.toLowerCase().startsWith(normalizedQuery)) {
      quickMatches.push({
        place_id: key.charCodeAt(0) * 1000 + key.charCodeAt(1),
        display_name: city.display,
        lat: city.lat,
        lon: city.lon,
        type: 'city',
        importance: 1,
      });
    }
  }

  // If we have quick matches and query is short, return them immediately
  if (quickMatches.length > 0 && query.length < 5) {
    return quickMatches.slice(0, 5);
  }

  // For longer queries, search Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=in&bounded=0`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AccidentHeatmapApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json();
    
    // Combine quick matches with API results, removing duplicates
    const combinedResults = [...quickMatches];
    for (const result of results) {
      const isDuplicate = combinedResults.some(
        r => Math.abs(parseFloat(r.lat) - parseFloat(result.lat)) < 0.01 &&
             Math.abs(parseFloat(r.lon) - parseFloat(result.lon)) < 0.01
      );
      if (!isDuplicate) {
        combinedResults.push(result);
      }
    }
    
    // If still no results, try worldwide search
    if (combinedResults.length === 0 && query.length >= 4) {
      const globalUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const globalResponse = await fetch(globalUrl, {
        headers: {
          'User-Agent': 'AccidentHeatmapApp/1.0',
        },
      });
      if (globalResponse.ok) {
        return globalResponse.json();
      }
    }
    
    return combinedResults.slice(0, 8);
  } catch (error) {
    console.error('Geocoding error:', error);
    // Return quick matches as fallback
    return quickMatches.slice(0, 5);
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AccidentHeatmapApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  return data.display_name || `${lat}, ${lng}`;
};
