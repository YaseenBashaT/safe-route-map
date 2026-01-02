import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, lat, lon } = await req.json();

    if (action === 'search') {
      const params = new URLSearchParams({
        format: 'json',
        limit: '20',
        addressdetails: '1',
        extratags: '1',
        namedetails: '1',
        dedupe: '1',
        q: query,
      });
      
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      console.log(`Searching for: ${query}`);
      
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
      console.log(`Found ${data.length} results for "${query}"`);
      
      return new Response(JSON.stringify({ success: true, data }), {
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
