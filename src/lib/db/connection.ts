import mongoose from 'mongoose';
import { addLog } from '@/lib/services/logger';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGODB_URI environment variable is missing from process.env. Please configure MONGODB_URI in your Render.com or local environment variables.';
    addLog('ERROR', 'DATABASE', errorMsg, {
      hint: 'Navigate to Render.com -> Your Web Service -> Environment -> Add MONGODB_URI',
    });
    throw new Error(errorMsg);
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    addLog('TASK', 'DATABASE', 'Initiating connection to MongoDB...', {
      targetHost: uri.includes('@') ? uri.split('@')[1].split('/')[0] : 'localhost',
    });

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      addLog('INFO', 'DATABASE', 'MongoDB connection established successfully.', {
        readyState: mongoose.connection.readyState,
        databaseName: mongoose.connection.name,
      });
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    const errorMessage = e instanceof Error ? e.message : String(e);
    addLog('ERROR', 'DATABASE', `MongoDB connection failed: ${errorMessage}`, {
      rawError: errorMessage,
      hint: 'Verify IP Access List on MongoDB Atlas (allow 0.0.0.0/0 for Render) and check database credentials.',
    });
    throw e;
  }

  return cached.conn;
}
