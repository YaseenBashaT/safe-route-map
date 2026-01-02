import { supabase } from "@/integrations/supabase/client";
import { searchLocalCache, searchCachedApiResults, cacheApiResults, mergeResults } from './searchCache';

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

// Direct Nominatim fallback when edge function fails
const fetchFromNominatimDirect = async (query: string): Promise<NominatimResult[]> => {
  try {
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: '15',
      addressdetails: '1',
      countrycodes: 'in', // Focus on India for faster results
    });
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Direct Nominatim error:', response.status);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Direct Nominatim fetch error:', error);
    return [];
  }
};

// Ultra-fast search: local cache first, then API with direct fallback
export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 2) return [];

  const startTime = performance.now();

  // Step 1: Instant local results (< 1ms)
  const localResults = searchLocalCache(query);
  console.log(`Local search took ${(performance.now() - startTime).toFixed(1)}ms, found ${localResults.length} results`);
  
  // If we have good local results, return immediately for speed
  if (localResults.length >= 5) {
    return localResults;
  }

  // Step 2: Check cached API results (< 1ms)
  const cachedApiResults = searchCachedApiResults(query);
  if (cachedApiResults) {
    console.log(`Using cached API results for "${query}"`);
    return mergeResults(localResults, cachedApiResults);
  }

  // Step 3: Fetch from edge function first, then direct fallback
  let apiResults: NominatimResult[] = [];
  
  try {
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { action: 'search', query },
    });

    if (!error && data?.success && data.data?.length > 0) {
      apiResults = data.data;
      console.log(`Edge function returned ${apiResults.length} results`);
    } else {
      console.log('Edge function failed or empty, trying direct Nominatim...');
      apiResults = await fetchFromNominatimDirect(query);
    }
  } catch (error) {
    console.error('Edge function error, falling back to direct:', error);
    apiResults = await fetchFromNominatimDirect(query);
  }

  // Cache API results for future use
  if (apiResults.length > 0) {
    cacheApiResults(query, apiResults);
  }

  // Sort and merge
  const sortedApiResults = apiResults
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 10);

  console.log(`Total search took ${(performance.now() - startTime).toFixed(1)}ms, found ${sortedApiResults.length} API results`);
  
  return mergeResults(localResults, sortedApiResults);
}

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
