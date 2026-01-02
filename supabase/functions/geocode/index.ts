import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// STRICT INDIA FILTER - Rejects any location not in India
const isIndiaLocation = (result: any): boolean => {
  const displayName = result.display_name?.toLowerCase() || '';
  const country = result.address?.country?.toLowerCase() || '';
  
  // Must contain "india" in display name or have India as country
  const hasIndia = displayName.includes('india') || country === 'india';
  
  // Reject if contains other country names
  const otherCountries = ['pakistan', 'bangladesh', 'nepal', 'sri lanka', 'china', 'myanmar', 'bhutan', 'afghanistan', 'usa', 'united states', 'united kingdom', 'canada', 'australia'];
  const hasOtherCountry = otherCountries.some(c => displayName.includes(c));
  
  return hasIndia && !hasOtherCountry;
};

// Small delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Search Nominatim with given query - INDIA ONLY with retry
const searchNominatim = async (query: string, retries = 2): Promise<any[]> => {
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
  
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await delay(500 * attempt); // Exponential backoff
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SafeRouteApp/1.0 (https://lovable.dev)',
          'Accept-Language': 'en',
        },
      });

      if (response.status === 429) {
        console.log(`Rate limited, attempt ${attempt + 1}/${retries + 1}`);
        continue;
      }

      if (!response.ok) {
        console.error(`Nominatim error: ${response.status}`);
        return [];
      }

      const results = await response.json();
      
      // STRICT: Filter to only India locations
      return results.filter(isIndiaLocation);
    } catch (error) {
      console.error(`Search error attempt ${attempt + 1}:`, error);
      if (attempt === retries) return [];
    }
  }
  
  return [];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, lat, lon } = await req.json();

    if (action === 'search') {
      console.log(`Searching India for: ${query}`);
      
      // Run searches in batches to avoid rate limiting
      // Batch 1: Most important searches
      const [directResults, withIndiaResults, withCityResults] = await Promise.all([
        searchNominatim(query),
        searchNominatim(`${query}, India`),
        searchNominatim(`${query} city`),
      ]);
      
      // Small delay between batches
      await delay(100);
      
      // Batch 2: Administrative searches
      const [withDistrictResults, withTehsilResults] = await Promise.all([
        searchNominatim(`${query} district`),
        searchNominatim(`${query} tehsil`),
      ]);
      
      // Small delay between batches
      await delay(100);
      
      // Batch 3: Small locality searches (most important for villages)
      const [withVillageResults, withTownResults] = await Promise.all([
        searchNominatim(`${query} village`),
        searchNominatim(`${query} town`),
      ]);
      
      // Merge and deduplicate results by place_id
      const allResults = [
        ...directResults, 
        ...withIndiaResults, 
        ...withCityResults, 
        ...withDistrictResults,
        ...withVillageResults,
        ...withTownResults,
        ...withTehsilResults,
      ];
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.place_id, item])).values()
      );
      
      // Sort by importance
      uniqueResults.sort((a, b) => (b.importance || 0) - (a.importance || 0));
      
      console.log(`Found ${uniqueResults.length} unique India results for "${query}"`);
      
      return new Response(JSON.stringify({ success: true, data: uniqueResults.slice(0, 30) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'reverse') {
      const params = new URLSearchParams({
        format: 'json',
        lat: lat.toString(),
        lon: lon.toString(),
        zoom: '18',
        addressdetails: '1',
      });
      const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SafeRouteApp/1.0 (https://lovable.dev)',
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
