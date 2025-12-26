import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { verifyEmailSchema } from '@/lib/validators/auth.server';
import {
	successResponse,
	validationErrorResponse,
	errorResponse,
	serverErrorResponse
} from '@/lib/api/response';
import { logger } from '@/lib/config/env';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * POST /api/auth/verify-email
 *
 * Verify user's email address using verification token
 *
 * Body: { token }
 * Response: { success, data: { message } }
 */
export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validation = verifyEmailSchema.safeParse(body);

		if (!validation.success) {
			return validationErrorResponse(validation.error);
		}

		const { token } = validation.data;

		// Connect to database
		await connectDB();

		// Find user with matching verification token
		const user = await User.findOne({
			emailVerificationToken: token,
			emailVerificationExpires: { $gt: new Date() },
			isDeleted: false
		}).select('+emailVerificationToken +emailVerificationExpires');

		if (!user) {
			return errorResponse('Invalid or expired verification token', 400);
		}

		// Mark email as verified
		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;

		await user.save();

		// Send welcome email (awaited to ensure it sends on serverless platforms)
		try {
			const emailResult = await sendWelcomeEmail(user.email, user.name);
			if (emailResult.success) {
				logger.info('Welcome email sent', { email: user.email });
			} else {
				logger.error('Failed to send welcome email', {
					email: user.email,
					error: emailResult.error
				});
			}
		} catch (emailError) {
			logger.error('Error sending welcome email', emailError);
		}

		return successResponse({
			message: 'Email verified successfully'
		});
	} catch (error) {
		return serverErrorResponse(error);
	}
}

/**
 * GET /api/auth/verify-email
 *
 * Verify email via link (token in query string)
 * Redirects to frontend with result
 *
 * Query: ?token=xxx
 * Response: Redirect to /auth/verified or /auth/verification-failed
 */
export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const token = searchParams.get('token');
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

	if (!token) {
		return Response.redirect(`${baseUrl}/auth/login?error=missing_token`);
	}

	try {
		await connectDB();

		// Find user with matching verification token
		const user = await User.findOne({
			emailVerificationToken: token,
			emailVerificationExpires: { $gt: new Date() },
			isDeleted: false
		}).select('+emailVerificationToken +emailVerificationExpires');

		if (!user) {
			return Response.redirect(`${baseUrl}/auth/login?error=invalid_token`);
		}

		// Mark email as verified
		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;

		await user.save();

		// Send welcome email (awaited to ensure it sends on serverless platforms)
		try {
			const emailResult = await sendWelcomeEmail(user.email, user.name);
			if (emailResult.success) {
				logger.info('Welcome email sent (via link)', { email: user.email });
			}
		} catch {
			// Silently fail - user still verified
		}

		// Redirect to success page
		return Response.redirect(`${baseUrl}/auth/login?verified=true`);
	} catch (error) {
		logger.error('Email verification error', error);
		return Response.redirect(`${baseUrl}/auth/login?error=verification_failed`);
	}
}

