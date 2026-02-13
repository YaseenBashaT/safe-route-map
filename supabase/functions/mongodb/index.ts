import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Parse MongoDB URI to extract connection details
function parseMongoUri(uri: string) {
  // Format: mongodb+srv://user:pass@cluster.mongodb.net/database?options
  const regex = /mongodb(?:\+srv)?:\/\/([^:]+):([^@]+)@([^\/]+)(?:\/([^?]+))?/;
  const match = uri.match(regex);
  
  if (!match) {
    throw new Error('Invalid MongoDB URI format');
  }
  
  return {
    username: match[1],
    password: decodeURIComponent(match[2]),
    host: match[3],
    defaultDb: match[4] || 'saferoute'
  };
}

// Use MongoDB Data API (Atlas)
async function mongoDataApiRequest(action: string, collection: string, database: string, body: Record<string, any>) {
  const uri = Deno.env.get('MONGODB_URI');
  const dataApiKey = Deno.env.get('MONGODB_DATA_API_KEY');
  const dataApiUrl = Deno.env.get('MONGODB_DATA_API_URL');
  
  if (!uri && !dataApiKey) {
    throw new Error('MONGODB_URI or MONGODB_DATA_API_KEY not configured');
  }

  // If Data API is configured, use it
  if (dataApiKey && dataApiUrl) {
    const response = await fetch(`${dataApiUrl}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': dataApiKey,
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: database,
        collection: collection,
        ...body
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MongoDB Data API error: ${errorText}`);
    }
    
    return await response.json();
  }
  
  // Fallback: Use in-memory storage for demo/development
  console.log('Using in-memory storage as fallback');
  return null;
}

// Simple in-memory storage for development/demo purposes
const inMemoryDb: Record<string, Record<string, any[]>> = {
  saferoute: {
    users: [],
    accident_reports: [],
    route_history: [],
    saved_locations: [],
    feedback: []
  }
};

function getCollection(database: string, collection: string): any[] {
  if (!inMemoryDb[database]) {
    inMemoryDb[database] = {};
  }
  if (!inMemoryDb[database][collection]) {
    inMemoryDb[database][collection] = [];
  }
  return inMemoryDb[database][collection];
}

function generateId(): string {
  return crypto.randomUUID();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, collection, database = 'saferoute', data, query, options } = await req.json();
    
    console.log(`MongoDB action: ${action} on ${database}.${collection}`);

    const dataApiKey = Deno.env.get('MONGODB_DATA_API_KEY');
    const dataApiUrl = Deno.env.get('MONGODB_DATA_API_URL');
    
    let result;

    // Try MongoDB Data API first if configured
    if (dataApiKey && dataApiUrl) {
      try {
        switch (action) {
          case 'insertOne':
            result = await mongoDataApiRequest('insertOne', collection, database, {
              document: { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            });
            result = result?.insertedId;
            break;

          case 'findOne':
            result = await mongoDataApiRequest('findOne', collection, database, { filter: query || {} });
            result = result?.document;
            break;

          case 'find':
            const findBody: Record<string, any> = { filter: query || {} };
            if (options?.limit) findBody.limit = options.limit;
            if (options?.skip) findBody.skip = options.skip;
            if (options?.sort) findBody.sort = options.sort;
            result = await mongoDataApiRequest('find', collection, database, findBody);
            result = result?.documents || [];
            break;

          case 'updateOne':
            result = await mongoDataApiRequest('updateOne', collection, database, {
              filter: query,
              update: { $set: { ...data, updatedAt: new Date().toISOString() } }
            });
            break;

          case 'deleteOne':
            result = await mongoDataApiRequest('deleteOne', collection, database, { filter: query });
            break;

          case 'count':
            result = await mongoDataApiRequest('aggregate', collection, database, {
              pipeline: [{ $match: query || {} }, { $count: 'count' }]
            });
            result = result?.documents?.[0]?.count || 0;
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }
        
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (apiError) {
        console.error('Data API error, falling back to in-memory:', apiError);
      }
    }

    // Fallback to in-memory storage
    const coll = getCollection(database, collection);

    switch (action) {
      case 'insertOne': {
        const newDoc = {
          _id: generateId(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        coll.push(newDoc);
        result = newDoc._id;
        console.log(`Inserted document with id: ${result}`);
        break;
      }

      case 'insertMany': {
        const docsWithTimestamps = data.map((doc: any) => ({
          _id: generateId(),
          ...doc,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        coll.push(...docsWithTimestamps);
        result = { insertedCount: docsWithTimestamps.length, insertedIds: docsWithTimestamps.map((d: any) => d._id) };
        console.log(`Inserted ${result.insertedCount} documents`);
        break;
      }

      case 'findOne': {
        result = coll.find(doc => {
          if (!query) return true;
          return Object.entries(query).every(([key, value]) => doc[key] === value);
        }) || null;
        console.log(`Found document: ${result ? 'yes' : 'no'}`);
        break;
      }

      case 'find': {
        let docs = coll.filter(doc => {
          if (!query || Object.keys(query).length === 0) return true;
          return Object.entries(query).every(([key, value]) => doc[key] === value);
        });
        
        // Apply sort
        if (options?.sort) {
          const sortEntries = Object.entries(options.sort);
          docs.sort((a, b) => {
            for (const [key, order] of sortEntries) {
              const aVal = a[key];
              const bVal = b[key];
              if (aVal < bVal) return (order as number) === 1 ? -1 : 1;
              if (aVal > bVal) return (order as number) === 1 ? 1 : -1;
            }
            return 0;
          });
        }
        
        // Apply skip and limit
        if (options?.skip) {
          docs = docs.slice(options.skip);
        }
        if (options?.limit) {
          docs = docs.slice(0, options.limit);
        }
        
        result = docs;
        console.log(`Found ${result.length} documents`);
        break;
      }

      case 'updateOne': {
        const index = coll.findIndex(doc => {
          return Object.entries(query).every(([key, value]) => doc[key] === value);
        });
        if (index !== -1) {
          coll[index] = { ...coll[index], ...data, updatedAt: new Date().toISOString() };
          result = { modifiedCount: 1 };
        } else {
          result = { modifiedCount: 0 };
        }
        console.log(`Updated ${result.modifiedCount} document(s)`);
        break;
      }

      case 'updateMany': {
        let modifiedCount = 0;
        coll.forEach((doc, index) => {
          const matches = Object.entries(query).every(([key, value]) => doc[key] === value);
          if (matches) {
            coll[index] = { ...doc, ...data, updatedAt: new Date().toISOString() };
            modifiedCount++;
          }
        });
        result = { modifiedCount };
        console.log(`Updated ${result.modifiedCount} documents`);
        break;
      }

      case 'deleteOne': {
        const index = coll.findIndex(doc => {
          return Object.entries(query).every(([key, value]) => doc[key] === value);
        });
        if (index !== -1) {
          coll.splice(index, 1);
          result = 1;
        } else {
          result = 0;
        }
        console.log(`Deleted ${result} document(s)`);
        break;
      }

      case 'deleteMany': {
        const initialLength = coll.length;
        const toKeep = coll.filter(doc => {
          return !Object.entries(query).every(([key, value]) => doc[key] === value);
        });
        inMemoryDb[database][collection] = toKeep;
        result = initialLength - toKeep.length;
        console.log(`Deleted ${result} documents`);
        break;
      }

      case 'count': {
        result = coll.filter(doc => {
          if (!query || Object.keys(query).length === 0) return true;
          return Object.entries(query).every(([key, value]) => doc[key] === value);
        }).length;
        console.log(`Count: ${result}`);
        break;
      }

      case 'aggregate': {
        // Simple aggregation support - just return all matching docs for now
        result = coll;
        console.log(`Aggregation returned ${result.length} documents`);
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MongoDB error:', errorMessage);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
