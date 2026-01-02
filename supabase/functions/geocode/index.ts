import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Search Nominatim with given query
const searchNominatim = async (query: string, extraParams: Record<string, string> = {}): Promise<any[]> => {
  const params = new URLSearchParams({
    format: 'json',
    limit: '50',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    dedupe: '1',
    countrycodes: 'in',
    q: query,
    ...extraParams,
  });
  
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SafeRouteApp/1.0 (https://lovable.dev)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      console.error(`Nominatim error: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, lat, lon } = await req.json();

    if (action === 'search') {
      console.log(`Searching India for: ${query}`);
      
      // Run multiple search strategies in parallel for comprehensive results
      const [
        directResults,
        withIndiaResults,
        withCityResults,
        withDistrictResults,
        withVillageResults,
        withTownResults,
        withTehsilResults,
      ] = await Promise.all([
        searchNominatim(query),
        searchNominatim(`${query}, India`),
        searchNominatim(`${query} city`),
        searchNominatim(`${query} district`),
        searchNominatim(`${query} village`),
        searchNominatim(`${query} town`),
        searchNominatim(`${query} tehsil`),
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
      
      console.log(`Found ${uniqueResults.length} unique results for "${query}"`);
      
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
