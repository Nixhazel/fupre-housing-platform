import { NextRequest } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { forgotPasswordSchema } from '@/lib/validators/auth.server';
import {
	successResponse,
	validationErrorResponse,
	serverErrorResponse
} from '@/lib/api/response';
import { logger } from '@/lib/config/env';

/**
 * POST /api/auth/forgot-password
 *
 * Request password reset email
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
		const validation = forgotPasswordSchema.safeParse(body);

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
				'If an account exists with this email, you will receive password reset instructions.'
		};

		if (!user) {
			// User doesn't exist, but return success anyway
			return successResponse(successMessage);
		}

		// Generate password reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		// Save token to user
		user.passwordResetToken = resetToken;
		user.passwordResetExpires = resetExpires;
		await user.save();

		// Build reset URL
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

		// TODO: Send email with reset link in future phase
		// Only log in development mode
		logger.debug('Password reset URL generated', { email: user.email, resetUrl });

		/*
		 * Email sending will be implemented in a future phase
		 * await sendEmail({
		 *   to: user.email,
		 *   subject: 'Password Reset Request',
		 *   template: 'password-reset',
		 *   data: { name: user.name, resetUrl }
		 * });
		 */

		return successResponse(successMessage);
	} catch (error) {
		return serverErrorResponse(error);
	}
}

