import { NextRequest } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { z } from 'zod';
import {
	successResponse,
	validationErrorResponse,
	errorResponse,
	serverErrorResponse
} from '@/lib/api/response';
import { sendVerificationEmail } from '@/lib/email';
import { logger } from '@/lib/config/env';

const resendVerificationSchema = z.object({
	email: z.string().email('Invalid email address')
});

/**
 * POST /api/auth/resend-verification
 *
 * Resend email verification link
 *
 * Body: { email }
 * Response: { success, data: { message } }
 *
 * Note: Always returns success to prevent email enumeration
 */
export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validation = resendVerificationSchema.safeParse(body);

		if (!validation.success) {
			return validationErrorResponse(validation.error);
		}

		const { email } = validation.data;

		// Connect to database
		await connectDB();

		// Find user by email
		const user = await User.findOne({ email, isDeleted: false });

		// Always return success message (prevents email enumeration)
		const successMessage = {
			message:
				'If an account exists with this email and is not yet verified, you will receive a verification email.'
		};

		if (!user) {
			// User doesn't exist, but return success anyway
			return successResponse(successMessage);
		}

		// Check if already verified
		if (user.isEmailVerified) {
			return errorResponse('Email is already verified', 400);
		}

		// Check rate limit (last verification email was sent less than 2 minutes ago)
		const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
		if (
			user.emailVerificationExpires &&
			user.emailVerificationExpires > new Date(Date.now() + 23 * 60 * 60 * 1000)
		) {
			// Token was generated less than 1 hour ago (24h - 23h = 1h)
			return errorResponse(
				'Verification email was recently sent. Please wait a few minutes before requesting another.',
				429
			);
		}

		// Generate new verification token
		const emailVerificationToken = crypto.randomBytes(32).toString('hex');
		const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Save token to user
		user.emailVerificationToken = emailVerificationToken;
		user.emailVerificationExpires = emailVerificationExpires;
		await user.save();

		// Build verification URL
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${emailVerificationToken}`;

		// Send verification email
		const emailResult = await sendVerificationEmail(user.email, {
			name: user.name,
			verifyUrl,
			expiresInHours: 24
		});

		if (!emailResult.success) {
			logger.error('Failed to resend verification email', {
				email: user.email,
				error: emailResult.error
			});
		} else {
			logger.info('Verification email resent', {
				email: user.email,
				messageId: emailResult.messageId
			});
		}

		return successResponse(successMessage);
	} catch (error) {
		return serverErrorResponse(error);
	}
}

