import { NextResponse } from 'next/server';
import { verifyEmailConnection, isEmailConfigured } from '@/lib/email';
import { isProduction } from '@/lib/config/env';

/**
 * GET /api/health/email
 *
 * Check email service health
 *
 * Note: Disabled in production for security
 */
export async function GET() {
	// Disable in production
	if (isProduction) {
		return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
	}

	const configured = isEmailConfigured();

	if (!configured) {
		return NextResponse.json({
			status: 'not_configured',
			message: 'SMTP credentials not set. Add SMTP_USER and SMTP_PASS to .env.local'
		});
	}

	try {
		const connected = await verifyEmailConnection();

		return NextResponse.json({
			status: connected ? 'healthy' : 'unhealthy',
			configured: true,
			connected,
			message: connected
				? 'Email service is configured and connected'
				: 'Email service is configured but connection failed'
		});
	} catch (error) {
		return NextResponse.json({
			status: 'error',
			configured: true,
			connected: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

