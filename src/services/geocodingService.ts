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
    road?: string;
    suburb?: string;
    neighbourhood?: string;
  };
  class?: string;
}

// Search using Nominatim API - searches globally like Google Maps
export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    // Search with comprehensive parameters for maximum coverage
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: '15',
      addressdetails: '1',
      extratags: '1',
      namedetails: '1',
      dedupe: '1',
    });

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AccidentHeatmapApp/1.0 (contact@example.com)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();
    
    // Sort by importance and return
    return results
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, 10);
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lng.toString(),
      zoom: '18',
      addressdetails: '1',
    });

    const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AccidentHeatmapApp/1.0 (contact@example.com)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      // Return coordinates as fallback
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    const data = await response.json();
    
    if (data.display_name) {
      return data.display_name;
    }
    
    // Return coordinates if no address found
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Always return valid coordinates on error
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Format display name to be more readable
export const formatDisplayName = (displayName: string): { primary: string; secondary: string } => {
  const parts = displayName.split(',').map(p => p.trim());
  
  if (parts.length === 0) {
    return { primary: 'Unknown Location', secondary: '' };
  }
  
  if (parts.length === 1) {
    return { primary: parts[0], secondary: '' };
  }
  
  return {
    primary: parts[0],
    secondary: parts.slice(1, 4).join(', '),
  };
};
