import { supabase } from "@/integrations/supabase/client";

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

// Search using Nominatim API via edge function to avoid CORS
export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { action: 'search', query },
    });

    if (error) {
      console.error('Geocoding edge function error:', error);
      return [];
    }

    if (!data.success) {
      console.error('Geocoding failed:', data.error);
      return [];
    }

    const results: NominatimResult[] = data.data;
    
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
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { action: 'reverse', lat, lon: lng },
    });

    if (error || !data.success) {
      // Return coordinates as fallback
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    if (data.data?.display_name) {
      return data.data.display_name;
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
