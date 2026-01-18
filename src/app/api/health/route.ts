import { NextResponse } from 'next/server';
import connectDB, { isConnected } from '@/lib/db/connect';
import { isProduction } from '@/lib/config/env';

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and load balancers
 *
 * Returns:
 * - 200: Service is healthy
 * - 503: Service is degraded (e.g., database unavailable)
 */
export async function GET() {
	const startTime = Date.now();

	// Basic health response
	const health: {
		status: 'healthy' | 'degraded';
		timestamp: string;
		uptime: number;
		version: string;
		environment: string;
		services: {
			database: 'connected' | 'disconnected' | 'error';
		};
		latency?: number;
	} = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		version: process.env.npm_package_version || '1.0.0',
		environment: process.env.NODE_ENV || 'development',
		services: {
			database: 'disconnected'
		}
	};

	// Check database connection
	try {
		if (isConnected()) {
			health.services.database = 'connected';
		} else {
			// Try to connect
			await connectDB();
			health.services.database = 'connected';
		}
	} catch {
		health.services.database = 'error';
		health.status = 'degraded';
	}

	// Calculate response latency
	health.latency = Date.now() - startTime;

	// In production, return minimal info
	if (isProduction) {
		return NextResponse.json(
			{
				status: health.status,
				timestamp: health.timestamp
			},
			{ status: health.status === 'healthy' ? 200 : 503 }
		);
	}

	// In development, return full health info
	return NextResponse.json(health, {
		status: health.status === 'healthy' ? 200 : 503
	});
}

