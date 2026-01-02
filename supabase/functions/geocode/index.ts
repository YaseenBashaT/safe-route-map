import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert Photon result to Nominatim-like format
const convertPhotonResult = (feature: any): any => {
  const props = feature.properties || {};
  const coords = feature.geometry?.coordinates || [0, 0];
  
  // Build display name from available properties
  const parts = [
    props.name,
    props.street,
    props.city || props.town || props.village,
    props.district,
    props.state,
    props.country
  ].filter(Boolean);
  
  return {
    place_id: `photon_${props.osm_id || Math.random()}`,
    display_name: parts.join(', ') || 'Unknown location',
    lat: coords[1].toString(),
    lon: coords[0].toString(),
    importance: props.importance || 0.5,
    address: {
      city: props.city,
      town: props.town,
      village: props.village,
      state: props.state,
      country: props.country,
      district: props.district,
    },
    type: props.osm_value || props.type || 'place',
  };
};

// STRICT INDIA FILTER
const isIndiaLocation = (result: any): boolean => {
  const displayName = result.display_name?.toLowerCase() || '';
  const country = result.address?.country?.toLowerCase() || '';
  
  const hasIndia = displayName.includes('india') || country === 'india';
  
  const otherCountries = ['pakistan', 'bangladesh', 'nepal', 'sri lanka', 'china', 'myanmar', 'bhutan', 'afghanistan', 'usa', 'united states', 'united kingdom', 'canada', 'australia'];
  const hasOtherCountry = otherCountries.some(c => displayName.includes(c));
  
  return hasIndia && !hasOtherCountry;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Search using Photon API (free, OSM-based, generous limits)
const searchPhoton = async (query: string, retries = 2): Promise<any[]> => {
  // India bounding box for better results
  const bbox = '68.1,6.5,97.4,35.5'; // minLon,minLat,maxLon,maxLat
  
  const params = new URLSearchParams({
    q: query,
    limit: '30',
    lang: 'en',
    bbox: bbox,
  });
  
  const url = `https://photon.komoot.io/api/?${params.toString()}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await delay(300 * attempt);
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SafeRouteApp/1.0',
          'Accept': 'application/json',
        },
      });

      if (response.status === 429) {
        console.log(`Rate limited, attempt ${attempt + 1}/${retries + 1}`);
        continue;
      }

      if (!response.ok) {
        console.error(`Photon error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const features = data.features || [];
      
      // Convert to Nominatim-like format and filter to India
      const results = features.map(convertPhotonResult);
      return results.filter(isIndiaLocation);
    } catch (error) {
      console.error(`Search error attempt ${attempt + 1}:`, error);
      if (attempt === retries) return [];
    }
  }
  
  return [];
};

// Reverse geocode using Photon
const reversePhoton = async (lat: number, lon: number): Promise<any> => {
  const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SafeRouteApp/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Photon reverse error: ${response.status}`);
    }

    const data = await response.json();
    const features = data.features || [];
    
    if (features.length > 0) {
      return convertPhotonResult(features[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
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
      
      // Search with multiple query variations
      const [directResults, withIndiaResults, withCityResults] = await Promise.all([
        searchPhoton(query),
        searchPhoton(`${query} India`),
        searchPhoton(`${query} city India`),
      ]);
      
      await delay(100);
      
      const [villageResults, districtResults] = await Promise.all([
        searchPhoton(`${query} village India`),
        searchPhoton(`${query} district India`),
      ]);
      
      // Merge and deduplicate
      const allResults = [
        ...directResults, 
        ...withIndiaResults, 
        ...withCityResults, 
        ...villageResults,
        ...districtResults,
      ];
      
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.display_name, item])).values()
      );
      
      uniqueResults.sort((a, b) => (b.importance || 0) - (a.importance || 0));
      
      console.log(`Found ${uniqueResults.length} unique India results for "${query}"`);
      
      return new Response(JSON.stringify({ success: true, data: uniqueResults.slice(0, 30) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'reverse') {
      const result = await reversePhoton(lat, lon);
      
      if (result) {
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ success: true, data: { display_name: `${lat}, ${lon}` } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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
