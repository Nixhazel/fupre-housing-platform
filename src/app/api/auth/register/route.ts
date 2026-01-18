import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { registerSchema } from '@/lib/validators/auth.server';
import { createTokenPair } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { toSessionUser } from '@/lib/auth/session';
import {
	validationErrorResponse,
	conflictResponse,
	serverErrorResponse
} from '@/lib/api/response';
import { sendVerificationEmail } from '@/lib/email';
import { logger } from '@/lib/config/env';

/**
 * POST /api/auth/register
 *
 * Register a new user account
 *
 * Body: { email, password, name, phone?, role, matricNumber? }
 * Response: { success, data: { user, message } }
 */
export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validation = registerSchema.safeParse(body);

		if (!validation.success) {
			return validationErrorResponse(validation.error);
		}

		const { email, password, name, phone, role, matricNumber } =
			validation.data;

		// Connect to database
		await connectDB();

		// Check if user already exists
		const existingUser = await User.findOne({ email, isDeleted: false });
		if (existingUser) {
			return conflictResponse('An account with this email already exists');
		}

		// Generate email verification token
		const emailVerificationToken = crypto.randomBytes(32).toString('hex');
		const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Create new user
		const user = await User.create({
			email,
			password, // Will be hashed by pre-save hook
			name,
			phone,
			role,
			matricNumber,
			isEmailVerified: false,
			isVerified: false,
			emailVerificationToken,
			emailVerificationExpires,
			savedListingIds: [],
			unlockedListingIds: []
		});

		// Build verification URL
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${emailVerificationToken}`;

		// Send verification email (awaited to ensure it sends on serverless platforms)
		try {
			const emailResult = await sendVerificationEmail(user.email, {
				name: user.name,
				verifyUrl,
				expiresInHours: 24
			});

			if (emailResult.success) {
				logger.info('Verification email sent', { email: user.email });
			} else {
				logger.error('Failed to send verification email', {
					email: user.email,
					error: emailResult.error
				});
			}
		} catch (emailError) {
			// Don't fail registration if email fails, user can resend
			logger.error('Error sending verification email', emailError);
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
					user: toSessionUser(user),
					message: 'Registration successful. Please verify your email.'
				}
			},
			{ status: 201 }
		);

		// Set auth cookies
		return setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
	} catch (error) {
		// Handle MongoDB duplicate key error
		if (error instanceof Error && error.message.includes('duplicate key')) {
			return conflictResponse('An account with this email already exists');
		}

		return serverErrorResponse(error);
	}
}
