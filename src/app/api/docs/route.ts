import { NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/openapi';
import { isProduction } from '@/lib/config/env';

/**
 * GET /api/docs
 *
 * Serves the OpenAPI specification as JSON
 * Used by Swagger UI to render documentation
 *
 * SECURITY: Disabled in production
 */
export async function GET() {
	// Disable API docs in production
	if (isProduction) {
		return NextResponse.json(
			{ error: 'API documentation is not available in production' },
			{ status: 404 }
		);
	}

	return NextResponse.json(openApiSpec);
}

