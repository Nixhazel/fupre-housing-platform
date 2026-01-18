import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { withAuth, type AuthContext } from '@/lib/auth/guards';
import {
	successResponse,
	notFoundResponse,
	handleError
} from '@/lib/api/response';

// Next.js 15 route params type
type RouteParams = { params: Promise<{ id: string }> };

/**
 * DELETE /api/users/me/saved-roommates/[id]
 *
 * Remove a roommate listing from saved favorites
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Roommate listing ID to unsave
 *
 * Response: { success, data: { message, savedRoommateIds } }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const handler = withAuth(
		async (_req: NextRequest, context: AuthContext) => {
			try {
				const { id: roommateId } = await params;

				if (!roommateId) {
					return notFoundResponse('Roommate listing ID is required');
				}

				await connectDB();

				const user = await User.findActiveById(context.user.userId);
				if (!user) {
					return notFoundResponse('User not found');
				}

				// Initialize array if it doesn't exist
				if (!user.savedRoommateIds) {
					user.savedRoommateIds = [];
				}

				// Check if roommate is saved
				const savedIndex = user.savedRoommateIds.findIndex(
					(id) => id.toString() === roommateId
				);

				if (savedIndex === -1) {
					return notFoundResponse('Roommate listing is not in your saved list');
				}

				// Remove from saved roommates
				user.savedRoommateIds.splice(savedIndex, 1);
				await user.save();

				return successResponse({
					message: 'Roommate listing removed from saved',
					savedRoommateIds: user.savedRoommateIds.map((id) => id.toString())
				});
			} catch (error) {
				return handleError(error);
			}
		}
	);

	return handler(request);
}

