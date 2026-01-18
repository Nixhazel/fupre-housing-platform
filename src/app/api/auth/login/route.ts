import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { loginSchema } from '@/lib/validators/auth.server';
import { createTokenPair } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { toSessionUser } from '@/lib/auth/session';
import {
	validationErrorResponse,
	errorResponse,
	serverErrorResponse
} from '@/lib/api/response';

/**
 * POST /api/auth/login
 *
 * Authenticate user and create session
 *
 * Body: { email, password }
 * Response: { success, data: { user } }
 */
export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validation = loginSchema.safeParse(body);

		if (!validation.success) {
			return validationErrorResponse(validation.error);
		}

		const { email, password } = validation.data;

		// Connect to database
		await connectDB();

		// Find user by email (includes password for comparison)
		const user = await User.findByEmail(email);

		if (!user) {
			// Use generic message to prevent email enumeration
			return errorResponse('Invalid email or password', 401);
		}

		// Check if user is soft-deleted
		if (user.isDeleted) {
			return errorResponse('This account has been deactivated', 401);
		}

		// Verify password
		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			return errorResponse('Invalid email or password', 401);
		}

		// Generate JWT tokens
		const tokens = await createTokenPair({
			userId: user._id.toString(),
			email: user.email,
			role: user.role
		});

		// Create response with user data
		const response = NextResponse.json(
			{
				success: true,
				data: {
					user: toSessionUser(user)
				}
			},
			{ status: 200 }
		);

		// Set auth cookies
		return setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
	} catch (error) {
		return serverErrorResponse(error);
	}
}

