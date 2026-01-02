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

// Fetch from edge function - this avoids CORS issues completely
const fetchFromEdgeFunction = async (query: string): Promise<NominatimResult[]> => {
  try {
    console.log(`Edge function INDIA-ONLY search: "${query}"`);
    
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { action: 'search', query },
    });

    if (error) {
      console.error('Edge function error:', error);
      return [];
    }

    if (data?.success && Array.isArray(data.data)) {
      console.log(`Edge function returned ${data.data.length} INDIA results`);
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('Edge function fetch error:', error);
    return [];
  }
};

// Search: local cache first, then edge function (no direct browser calls to avoid CORS)
export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 2) return [];

  const startTime = performance.now();

  // Step 1: Instant local results
  const localResults = searchLocalCache(query);
  console.log(`Local search took ${(performance.now() - startTime).toFixed(1)}ms, found ${localResults.length} results`);
  
  // If we have good local results, return immediately
  if (localResults.length >= 5) {
    return localResults;
  }

  // Step 2: Check cached API results
  const cachedApiResults = searchCachedApiResults(query);
  if (cachedApiResults) {
    console.log(`Using cached API results for "${query}"`);
    return mergeResults(localResults, cachedApiResults);
  }

  // Step 3: Use edge function ONLY (avoids CORS issues with direct Nominatim calls)
  const apiResults = await fetchFromEdgeFunction(query);

  // Cache API results for future use
  if (apiResults.length > 0) {
    cacheApiResults(query, apiResults);
  }

  // Sort and merge
  const sortedApiResults = apiResults
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 15);

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
