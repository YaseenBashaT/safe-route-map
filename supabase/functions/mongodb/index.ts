import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let client: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (!client) {
    const uri = Deno.env.get('MONGODB_URI');
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }
    client = new MongoClient();
    await client.connect(uri);
    console.log('Connected to MongoDB');
  }
  return client;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, collection, database, data, query, options } = await req.json();
    
    console.log(`MongoDB action: ${action} on ${database}.${collection}`);

    const mongoClient = await getClient();
    const db = mongoClient.database(database || 'saferoute');
    const coll = db.collection(collection);

    let result;

    switch (action) {
      case 'insertOne':
        result = await coll.insertOne({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`Inserted document with id: ${result}`);
        break;

      case 'insertMany':
        const docsWithTimestamps = data.map((doc: any) => ({
          ...doc,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        result = await coll.insertMany(docsWithTimestamps);
        console.log(`Inserted ${result.insertedCount} documents`);
        break;

      case 'findOne':
        result = await coll.findOne(query || {});
        console.log(`Found document: ${result ? 'yes' : 'no'}`);
        break;

      case 'find':
        const cursor = coll.find(query || {});
        if (options?.limit) {
          cursor.limit(options.limit);
        }
        if (options?.skip) {
          cursor.skip(options.skip);
        }
        if (options?.sort) {
          cursor.sort(options.sort);
        }
        result = await cursor.toArray();
        console.log(`Found ${result.length} documents`);
        break;

      case 'updateOne':
        result = await coll.updateOne(query, {
          $set: { ...data, updatedAt: new Date() },
        });
        console.log(`Updated ${result.modifiedCount} document(s)`);
        break;

      case 'updateMany':
        result = await coll.updateMany(query, {
          $set: { ...data, updatedAt: new Date() },
        });
        console.log(`Updated ${result.modifiedCount} documents`);
        break;

      case 'deleteOne':
        result = await coll.deleteOne(query);
        console.log(`Deleted ${result} document(s)`);
        break;

      case 'deleteMany':
        result = await coll.deleteMany(query);
        console.log(`Deleted ${result} documents`);
        break;

      case 'count':
        result = await coll.countDocuments(query || {});
        console.log(`Count: ${result}`);
        break;

      case 'aggregate':
        result = await coll.aggregate(data).toArray();
        console.log(`Aggregation returned ${result.length} documents`);
        break;

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
