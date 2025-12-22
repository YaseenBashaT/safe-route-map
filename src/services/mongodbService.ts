import { supabase } from "@/integrations/supabase/client";

interface MongoDBResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

const DEFAULT_DATABASE = 'saferoute';

async function callMongoDB<T = any>(
  action: string,
  collection: string,
  params: {
    data?: any;
    query?: Record<string, any>;
    options?: QueryOptions;
    database?: string;
  } = {}
): Promise<MongoDBResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke('mongodb', {
      body: {
        action,
        collection,
        database: params.database || DEFAULT_DATABASE,
        data: params.data,
        query: params.query,
        options: params.options,
      },
    });

    if (error) {
      console.error('MongoDB service error:', error);
      return { success: false, error: error.message };
    }

    return data as MongoDBResponse<T>;
  } catch (err: any) {
    console.error('MongoDB service exception:', err);
    return { success: false, error: err.message };
  }
}

// User operations
export const userService = {
  async createUser(userData: {
    email: string;
    name?: string;
    preferences?: Record<string, any>;
  }) {
    return callMongoDB('insertOne', 'users', { data: userData });
  },

  async getUserByEmail(email: string) {
    return callMongoDB('findOne', 'users', { query: { email } });
  },

  async getUserById(id: string) {
    return callMongoDB('findOne', 'users', { query: { _id: id } });
  },

  async updateUser(email: string, updates: Record<string, any>) {
    return callMongoDB('updateOne', 'users', {
      query: { email },
      data: updates,
    });
  },

  async deleteUser(email: string) {
    return callMongoDB('deleteOne', 'users', { query: { email } });
  },
};

// Route history operations
export const routeHistoryService = {
  async saveRoute(routeData: {
    userId: string;
    origin: { lat: number; lon: number; name: string };
    destination: { lat: number; lon: number; name: string };
    distance?: number;
    duration?: number;
    safetyScore?: number;
  }) {
    return callMongoDB('insertOne', 'route_history', { data: routeData });
  },

  async getUserRoutes(userId: string, limit = 10) {
    return callMongoDB('find', 'route_history', {
      query: { userId },
      options: { limit, sort: { createdAt: -1 } },
    });
  },

  async deleteRoute(routeId: string) {
    return callMongoDB('deleteOne', 'route_history', { query: { _id: routeId } });
  },
};

// Saved locations operations
export const savedLocationsService = {
  async saveLocation(locationData: {
    userId: string;
    name: string;
    lat: number;
    lon: number;
    type: 'home' | 'work' | 'favorite';
  }) {
    return callMongoDB('insertOne', 'saved_locations', { data: locationData });
  },

  async getUserLocations(userId: string) {
    return callMongoDB('find', 'saved_locations', {
      query: { userId },
      options: { sort: { createdAt: -1 } },
    });
  },

  async updateLocation(locationId: string, updates: Record<string, any>) {
    return callMongoDB('updateOne', 'saved_locations', {
      query: { _id: locationId },
      data: updates,
    });
  },

  async deleteLocation(locationId: string) {
    return callMongoDB('deleteOne', 'saved_locations', { query: { _id: locationId } });
  },
};

// Feedback operations
export const feedbackService = {
  async submitFeedback(feedbackData: {
    userId?: string;
    routeId?: string;
    rating: number;
    comment?: string;
    type: 'route' | 'app' | 'safety';
  }) {
    return callMongoDB('insertOne', 'feedback', { data: feedbackData });
  },

  async getFeedback(limit = 50) {
    return callMongoDB('find', 'feedback', {
      options: { limit, sort: { createdAt: -1 } },
    });
  },
};

// Generic MongoDB operations for custom use cases
export const mongodbService = {
  insertOne: <T = any>(collection: string, data: any, database?: string) =>
    callMongoDB<T>('insertOne', collection, { data, database }),

  insertMany: <T = any>(collection: string, data: any[], database?: string) =>
    callMongoDB<T>('insertMany', collection, { data, database }),

  findOne: <T = any>(collection: string, query: Record<string, any>, database?: string) =>
    callMongoDB<T>('findOne', collection, { query, database }),

  find: <T = any>(collection: string, query?: Record<string, any>, options?: QueryOptions, database?: string) =>
    callMongoDB<T>('find', collection, { query, options, database }),

  updateOne: <T = any>(collection: string, query: Record<string, any>, data: any, database?: string) =>
    callMongoDB<T>('updateOne', collection, { query, data, database }),

  updateMany: <T = any>(collection: string, query: Record<string, any>, data: any, database?: string) =>
    callMongoDB<T>('updateMany', collection, { query, data, database }),

  deleteOne: <T = any>(collection: string, query: Record<string, any>, database?: string) =>
    callMongoDB<T>('deleteOne', collection, { query, database }),

  deleteMany: <T = any>(collection: string, query: Record<string, any>, database?: string) =>
    callMongoDB<T>('deleteMany', collection, { query, database }),

  count: <T = number>(collection: string, query?: Record<string, any>, database?: string) =>
    callMongoDB<T>('count', collection, { query, database }),

  aggregate: <T = any>(collection: string, pipeline: any[], database?: string) =>
    callMongoDB<T>('aggregate', collection, { data: pipeline, database }),
};
