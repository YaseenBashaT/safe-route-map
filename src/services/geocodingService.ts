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

// STRICT INDIA FILTER - Rejects any location not in India
const isIndiaLocation = (result: NominatimResult): boolean => {
  const displayName = result.display_name?.toLowerCase() || '';
  const country = result.address?.country?.toLowerCase() || '';
  
  // Must contain "india" in display name or have India as country
  const hasIndia = displayName.includes('india') || country === 'india';
  
  // Reject if contains other country names
  const otherCountries = ['pakistan', 'bangladesh', 'nepal', 'sri lanka', 'china', 'myanmar', 'bhutan', 'afghanistan', 'usa', 'united states', 'united kingdom', 'canada', 'australia'];
  const hasOtherCountry = otherCountries.some(c => displayName.includes(c));
  
  return hasIndia && !hasOtherCountry;
};

// Helper to search Nominatim with specific query - INDIA ONLY
const searchNominatimQuery = async (query: string): Promise<NominatimResult[]> => {
  const params = new URLSearchParams({
    format: 'json',
    limit: '50',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    dedupe: '1',
    countrycodes: 'in',
    q: query,
  });
  
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'SafeRouteApp/1.0',
    },
  });
  
  if (!response.ok) return [];
  const results = await response.json();
  
  // STRICT: Filter to only India locations
  return results.filter(isIndiaLocation);
};

// Direct Nominatim search with multiple strategies for comprehensive India coverage
const fetchFromNominatimDirect = async (query: string): Promise<NominatimResult[]> => {
  try {
    console.log(`Nominatim INDIA-ONLY search: "${query}"`);
    
    // Run multiple search strategies in parallel including villages and towns
    const [direct, withIndia, withCity, withDistrict, withVillage, withTown, withTehsil] = await Promise.all([
      searchNominatimQuery(query),
      searchNominatimQuery(`${query}, India`),
      searchNominatimQuery(`${query} city`),
      searchNominatimQuery(`${query} district`),
      searchNominatimQuery(`${query} village`),
      searchNominatimQuery(`${query} town`),
      searchNominatimQuery(`${query} tehsil`),
    ]);
    
    // Merge and deduplicate - all results are already India-filtered
    const allResults = [...direct, ...withIndia, ...withCity, ...withDistrict, ...withVillage, ...withTown, ...withTehsil];
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.place_id, item])).values()
    );
    
    // Sort by importance
    uniqueResults.sort((a, b) => (b.importance || 0) - (a.importance || 0));
    
    console.log(`Found ${uniqueResults.length} INDIA-ONLY results for "${query}"`);
    return uniqueResults.slice(0, 30);
  } catch (error) {
    console.error('Nominatim fetch error:', error);
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

  // Step 3: Try edge function first, then always fallback to direct Nominatim
  let apiResults: NominatimResult[] = [];
  
  // Try edge function
  try {
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { action: 'search', query },
    });

    if (!error && data?.success && data.data?.length > 0) {
      apiResults = data.data;
      console.log(`Edge function returned ${apiResults.length} results`);
    }
  } catch (error) {
    console.log('Edge function unavailable:', error);
  }

  // If edge function failed or returned no results, try direct Nominatim
  if (apiResults.length === 0) {
    console.log('Trying direct Nominatim search...');
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
