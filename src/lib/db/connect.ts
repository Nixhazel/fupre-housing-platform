import mongoose from 'mongoose';
import { env, logger, isProduction } from '@/lib/config/env';

/**
 * MongoDB Connection Singleton
 *
 * Uses a cached connection to prevent multiple connections
 * in serverless environments (Vercel)
 *
 * Features:
 * - Connection pooling and reuse
 * - Graceful error handling
 * - Production-safe logging
 */

// Define the type for the cached connection
interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

// Declare global type for mongoose cache
declare global {
	var mongoose: MongooseCache | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
	global.mongoose = cached;
}

/**
 * Connect to MongoDB
 *
 * @returns Mongoose connection instance
 */
async function connectDB(): Promise<typeof mongoose> {
	// Return existing connection if available
	if (cached.conn) {
		return cached.conn;
	}

	// If a connection is in progress, wait for it
	if (!cached.promise) {
		const opts: mongoose.ConnectOptions = {
			bufferCommands: false,
			// Connection pool settings for serverless
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000
		};

		cached.promise = mongoose
			.connect(env.mongodbUri, opts)
			.then((mongoose) => {
				logger.info('MongoDB connected successfully');
				return mongoose;
			});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		logger.error('MongoDB connection error', isProduction ? undefined : e);
		throw new Error('Database connection failed');
	}

	return cached.conn;
}

/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
export async function disconnectDB(): Promise<void> {
	if (cached.conn) {
		await mongoose.disconnect();
		cached.conn = null;
		cached.promise = null;
		logger.info('MongoDB disconnected');
	}
}

/**
 * Check if database is connected
 */
export function isConnected(): boolean {
	return mongoose.connection.readyState === 1;
}

export default connectDB;
