import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { withAuth, type AuthContext } from '@/lib/auth/guards';
import { toSessionUser } from '@/lib/auth/session';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/auth/me
 *
 * Get current authenticated user's profile
 *
 * Headers: Cookie (access_token, refresh_token)
 * Response: { success, data: { user } }
 */
export const GET = withAuth(
	async (_request: NextRequest, context: AuthContext) => {
		try {
			await connectDB();

			// Get fresh user data from database
			const user = await User.findActiveById(context.user.userId);

			if (!user) {
				return notFoundResponse('User not found');
			}

			return successResponse({
				user: toSessionUser(user)
			});
		} catch (error) {
			return serverErrorResponse(error);
		}
	}
);

/**
 * PATCH /api/auth/me
 *
 * Update current user's profile
 *
 * Headers: Cookie (access_token, refresh_token)
 * Body: { name?, phone?, avatarUrl?, matricNumber? }
 * Response: { success, data: { user } }
 */
export const PATCH = withAuth(
	async (request: NextRequest, context: AuthContext) => {
		try {
			const body = await request.json();

			await connectDB();

			// Find and update user
			const user = await User.findActiveById(context.user.userId);

			if (!user) {
				return notFoundResponse('User not found');
			}

			// Update allowed fields
			if (body.name !== undefined) user.name = body.name;
			if (body.phone !== undefined) user.phone = body.phone;
			if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;
			if (body.matricNumber !== undefined) user.matricNumber = body.matricNumber;

			await user.save();

			return successResponse({
				user: toSessionUser(user)
			});
		} catch (error) {
			return serverErrorResponse(error);
		}
	}
);

