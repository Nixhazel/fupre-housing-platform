import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { resetPasswordSchema } from '@/lib/validators/auth.server';
import {
	successResponse,
	validationErrorResponse,
	errorResponse,
	serverErrorResponse
} from '@/lib/api/response';
import { sendPasswordResetConfirmationEmail } from '@/lib/email';
import { logger } from '@/lib/config/env';

/**
 * POST /api/auth/reset-password
 *
 * Reset password using reset token
 *
 * Body: { token, password }
 * Response: { success, data: { message } }
 */
export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validation = resetPasswordSchema.safeParse(body);

		if (!validation.success) {
			return validationErrorResponse(validation.error);
		}

		const { token, password } = validation.data;

		// Connect to database
		await connectDB();

		// Find user with matching reset token
		const user = await User.findOne({
			passwordResetToken: token,
			passwordResetExpires: { $gt: new Date() },
			isDeleted: false
		}).select('+password +passwordResetToken +passwordResetExpires');

		if (!user) {
			return errorResponse('Invalid or expired reset token', 400);
		}

		// Update password (will be hashed by pre-save hook)
		user.password = password;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;

		await user.save();

		// Send confirmation email (awaited to ensure it sends on serverless platforms)
		try {
			const emailResult = await sendPasswordResetConfirmationEmail(user.email, user.name);
			if (emailResult.success) {
				logger.info('Password reset confirmation email sent', { email: user.email });
			} else {
				logger.error('Failed to send password reset confirmation email', {
					email: user.email,
					error: emailResult.error
				});
			}
		} catch (emailError) {
			logger.error('Error sending password reset confirmation email', emailError);
		}

		return successResponse({
			message: 'Password reset successfully. You can now log in with your new password.'
		});
	} catch (error) {
		return serverErrorResponse(error);
	}
}

/**
 * GET /api/auth/reset-password
 *
 * Validate reset token (for frontend to check before showing form)
 *
 * Query: ?token=xxx
 * Response: { success, data: { valid } }
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const token = searchParams.get('token');

		if (!token) {
			return errorResponse('Reset token is required', 400);
		}

		await connectDB();

		// Check if token exists and is not expired
		const user = await User.findOne({
			passwordResetToken: token,
			passwordResetExpires: { $gt: new Date() },
			isDeleted: false
		}).select('_id');

		return successResponse({
			valid: !!user
		});
	} catch (error) {
		return serverErrorResponse(error);
	}
}

