import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import RoommateListing from '@/lib/db/models/RoommateListing';
import { withAuth, type AuthContext } from '@/lib/auth/guards';
import {
	successResponse,
	validationErrorResponse,
	notFoundResponse,
	conflictResponse,
	handleError
} from '@/lib/api/response';

const saveRoommateSchema = z.object({
	roommateId: z.string().min(1, 'Roommate listing ID is required')
});

/**
 * GET /api/users/me/saved-roommates
 *
 * Get current user's saved roommate listings
 *
 * Headers: Cookie (access_token, refresh_token)
 * Response: { success, data: { listings } }
 */
export const GET = withAuth(
	async (_request: NextRequest, context: AuthContext) => {
		try {
			await connectDB();

			const user = await User.findActiveById(context.user.userId);
			if (!user) {
				return notFoundResponse('User not found');
			}

			// Fetch saved roommate listings
			const listings = await RoommateListing.find({
				_id: { $in: user.savedRoommateIds || [] }
			})
				.populate('ownerId', 'name email avatarUrl isVerified')
				.sort({ createdAt: -1 })
				.lean();

			// Transform listings
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const transformedListings = listings.map((listing: any) => {
				const ownerData = listing.ownerId;
				const isPopulated = ownerData && typeof ownerData === 'object' && ownerData._id;

				return {
					id: listing._id.toString(),
					ownerId: isPopulated ? ownerData._id.toString() : ownerData?.toString(),
					ownerType: listing.ownerType,
					title: listing.title,
					budgetMonthly: listing.budgetMonthly,
					moveInDate: listing.moveInDate,
					description: listing.description,
					photos: listing.photos || [],
					preferences: listing.preferences || {},
					owner: isPopulated ? {
						id: ownerData._id.toString(),
						name: ownerData.name,
						email: ownerData.email,
						avatarUrl: ownerData.avatarUrl,
						isVerified: ownerData.isVerified
					} : null,
					createdAt: listing.createdAt,
					updatedAt: listing.updatedAt
				};
			});

			return successResponse({ listings: transformedListings });
		} catch (error) {
			return handleError(error);
		}
	}
);

/**
 * POST /api/users/me/saved-roommates
 *
 * Save a roommate listing to favorites
 *
 * Headers: Cookie (access_token, refresh_token)
 * Body: { roommateId }
 * Response: { success, data: { message, savedRoommateIds } }
 */
export const POST = withAuth(
	async (request: NextRequest, context: AuthContext) => {
		try {
			const body = await request.json();
			const validation = saveRoommateSchema.safeParse(body);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			const { roommateId } = validation.data;

			await connectDB();

			// Verify roommate listing exists
			const roommate = await RoommateListing.findById(roommateId);
			if (!roommate) {
				return notFoundResponse('Roommate listing not found');
			}

			const user = await User.findActiveById(context.user.userId);
			if (!user) {
				return notFoundResponse('User not found');
			}

			// Initialize array if it doesn't exist
			if (!user.savedRoommateIds) {
				user.savedRoommateIds = [];
			}

			// Check if already saved
			const alreadySaved = user.savedRoommateIds.some(
				(id) => id.toString() === roommateId
			);
			if (alreadySaved) {
				return conflictResponse('Roommate listing is already saved');
			}

			// Add to saved roommates
			user.savedRoommateIds.push(new mongoose.Types.ObjectId(roommateId));
			await user.save();

			return successResponse({
				message: 'Roommate listing saved successfully',
				savedRoommateIds: user.savedRoommateIds.map((id) => id.toString())
			});
		} catch (error) {
			return handleError(error);
		}
	}
);

