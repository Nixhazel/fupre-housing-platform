import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { verifyRefreshToken, createTokenPair } from '@/lib/auth/jwt';
import { getRefreshTokenFromRequest, setAuthCookies } from '@/lib/auth/cookies';
import { toSessionUser } from '@/lib/auth/session';
import { errorResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * POST /api/auth/refresh
 *
 * Refresh access token using refresh token
 *
 * Headers: Cookie (refresh_token)
 * Response: { success, data: { user } }
 */
export async function POST(request: NextRequest) {
	try {
		const refreshToken = getRefreshTokenFromRequest(request);

		if (!refreshToken) {
			return errorResponse('Refresh token not found', 401);
		}

		// Verify refresh token
		let payload;
		try {
			payload = await verifyRefreshToken(refreshToken);
		} catch {
			return errorResponse('Invalid or expired refresh token', 401);
		}

		// Connect to database and verify user still exists
		await connectDB();
		const user = await User.findActiveById(payload.userId);

		if (!user) {
			return errorResponse('User not found', 401);
		}

		// Verify user details match token
		if (user.email !== payload.email || user.role !== payload.role) {
			return errorResponse('Token data mismatch', 401);
		}

		// Generate new token pair
		const tokens = await createTokenPair({
			userId: user._id.toString(),
			email: user.email,
			role: user.role
		});

		// Create response
		const response = NextResponse.json(
			{
				success: true,
				data: {
					user: toSessionUser(user)
				}
			},
			{ status: 200 }
		);

		// Set new cookies
		return setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
	} catch (error) {
		return serverErrorResponse(error);
	}
}

