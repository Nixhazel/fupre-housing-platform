import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/cookies';

/**
 * POST /api/auth/logout
 *
 * Clear authentication cookies and end session
 *
 * Response: { success, data: { message } }
 */
export async function POST() {
	const response = NextResponse.json(
		{
			success: true,
			data: {
				message: 'Logged out successfully'
			}
		},
		{ status: 200 }
	);

	// Clear auth cookies
	return clearAuthCookies(response);
}

