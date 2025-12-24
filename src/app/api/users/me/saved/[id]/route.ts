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
 * DELETE /api/users/me/saved/[id]
 *
 * Remove a listing from saved favorites
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Listing ID to unsave
 *
 * Response: { success, data: { message, savedListingIds } }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const handler = withAuth(
		async (_req: NextRequest, context: AuthContext) => {
			try {
				const { id: listingId } = await params;

				if (!listingId) {
					return notFoundResponse('Listing ID is required');
				}

				await connectDB();

				const user = await User.findActiveById(context.user.userId);
				if (!user) {
					return notFoundResponse('User not found');
				}

				// Check if listing is saved
				const savedIndex = user.savedListingIds.findIndex(
					(id) => id.toString() === listingId
				);

				if (savedIndex === -1) {
					return notFoundResponse('Listing is not in your saved list');
				}

				// Remove from saved listings
				user.savedListingIds.splice(savedIndex, 1);
				await user.save();

				return successResponse({
					message: 'Listing removed from saved',
					savedListingIds: user.savedListingIds.map((id) => id.toString())
				});
			} catch (error) {
				return handleError(error);
			}
		}
	);

	return handler(request);
}

