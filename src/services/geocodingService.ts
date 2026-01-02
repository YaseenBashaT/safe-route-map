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

// India-only filter for client-side validation
const isIndiaResult = (result: NominatimResult): boolean => {
  const displayName = (result.display_name || '').toLowerCase();
  const country = (result.address?.country || '').toLowerCase();
  return displayName.includes('india') || country === 'india' || country.includes('india');
};

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
      // Double-check India filter on client side
      const indiaResults = data.data.filter(isIndiaResult);
      console.log(`Edge function returned ${indiaResults.length} INDIA results`);
      return indiaResults;
    }

    return [];
  } catch (error) {
    console.error('Edge function fetch error:', error);
    return [];
  }
};

// Search: ALWAYS call API and merge with local cache for comprehensive results
export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 2) return [];

  const startTime = performance.now();

  // Step 1: Get local results (for instant feedback, but never block API)
  const localResults = searchLocalCache(query);
  console.log(`Local cache: ${localResults.length} results in ${(performance.now() - startTime).toFixed(1)}ms`);

  // Step 2: Check if we have recent cached API results (less than 5 minutes old)
  const cachedApiResults = searchCachedApiResults(query);
  if (cachedApiResults && cachedApiResults.length > 0) {
    console.log(`Using cached API results for "${query}" (${cachedApiResults.length} results)`);
    return mergeResults(localResults, cachedApiResults, 25);
  }

  // Step 3: ALWAYS call edge function API for comprehensive results
  console.log(`Calling Photon API for "${query}"...`);
  const apiResults = await fetchFromEdgeFunction(query);

  // Cache API results for future use
  if (apiResults.length > 0) {
    cacheApiResults(query, apiResults);
  }

  // Sort API results by importance
  const sortedApiResults = apiResults
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 20);

  console.log(`API returned ${sortedApiResults.length} results, total time: ${(performance.now() - startTime).toFixed(1)}ms`);
  
  // Merge local + API results, return up to 25 results
  return mergeResults(localResults, sortedApiResults, 25);
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
