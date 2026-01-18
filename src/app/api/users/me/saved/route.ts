import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Listing from '@/lib/db/models/Listing';
import { withAuth, type AuthContext } from '@/lib/auth/guards';
import {
	successResponse,
	validationErrorResponse,
	notFoundResponse,
	conflictResponse,
	handleError
} from '@/lib/api/response';

const saveListingSchema = z.object({
	listingId: z.string().min(1, 'Listing ID is required')
});

/**
 * GET /api/users/me/saved
 *
 * Get current user's saved listings
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

			// Fetch saved listings
			const listings = await Listing.find({
				_id: { $in: user.savedListingIds },
				isDeleted: false
			})
				.select('title coverPhoto priceYearly university location bedrooms bathrooms status')
				.sort({ createdAt: -1 });

			return successResponse({ listings });
		} catch (error) {
			return handleError(error);
		}
	}
);

/**
 * POST /api/users/me/saved
 *
 * Save a listing to favorites
 *
 * Headers: Cookie (access_token, refresh_token)
 * Body: { listingId }
 * Response: { success, data: { message, savedListingIds } }
 */
export const POST = withAuth(
	async (request: NextRequest, context: AuthContext) => {
		try {
			const body = await request.json();
			const validation = saveListingSchema.safeParse(body);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			const { listingId } = validation.data;

			await connectDB();

			// Verify listing exists
			const listing = await Listing.findActiveById(listingId);
			if (!listing) {
				return notFoundResponse('Listing not found');
			}

			const user = await User.findActiveById(context.user.userId);
			if (!user) {
				return notFoundResponse('User not found');
			}

			// Check if already saved
			const alreadySaved = user.savedListingIds.some(
				(id) => id.toString() === listingId
			);
			if (alreadySaved) {
				return conflictResponse('Listing is already saved');
			}

			// Add to saved listings
			user.savedListingIds.push(new mongoose.Types.ObjectId(listingId));
			await user.save();

			return successResponse({
				message: 'Listing saved successfully',
				savedListingIds: user.savedListingIds.map((id) => id.toString())
			});
		} catch (error) {
			return handleError(error);
		}
	}
);

