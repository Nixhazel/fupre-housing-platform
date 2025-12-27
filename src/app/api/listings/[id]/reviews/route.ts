import { NextRequest } from 'next/server';
import { withAuth, withOptionalAuth, type AuthContext } from '@/lib/auth/guards';
import { createReviewSchema } from '@/lib/validators/reviews.server';
import * as reviewsService from '@/lib/services/reviews.service';
import {
	successResponse,
	validationErrorResponse,
	forbiddenResponse,
	notFoundResponse,
	conflictResponse,
	serverErrorResponse
} from '@/lib/api/response';

/**
 * GET /api/listings/[id]/reviews
 *
 * Get all reviews for a listing
 *
 * Path Parameters:
 * - id: Listing ID
 *
 * Response: { success, data: { reviews, averageRating, totalReviews } }
 */
export const GET = withOptionalAuth(
	async (request: NextRequest, context: AuthContext | null) => {
		try {
			// Get listing ID from URL
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			const listingIdIndex = pathParts.indexOf('listings') + 1;
			const listingId = pathParts[listingIdIndex];

			if (!listingId) {
				return notFoundResponse('Listing ID is required');
			}

			const result = await reviewsService.getListingReviews(listingId);

			// If user is authenticated, include their review status
			let userReview = null;
			let canReview = false;
			let hasReviewed = false;

			if (context?.user) {
				const reviewStatus = await reviewsService.canUserReview(
					context.user.userId,
					listingId
				);
				canReview = reviewStatus.canReview;
				hasReviewed = reviewStatus.hasReviewed;

				if (hasReviewed) {
					userReview = await reviewsService.getUserReviewForListing(
						context.user.userId,
						listingId
					);
				}
			}

			return successResponse({
				...result,
				userReview,
				canReview,
				hasReviewed
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes('not found')) {
				return notFoundResponse(error.message);
			}
			return serverErrorResponse(error);
		}
	}
);

/**
 * POST /api/listings/[id]/reviews
 *
 * Create a new review for a listing
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Listing ID
 * Body: { rating, comment }
 *
 * Response: { success, data: { review } }
 */
export const POST = withAuth(
	async (request: NextRequest, context: AuthContext) => {
		try {
			// Get listing ID from URL
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			const listingIdIndex = pathParts.indexOf('listings') + 1;
			const listingId = pathParts[listingIdIndex];

			if (!listingId) {
				return notFoundResponse('Listing ID is required');
			}

			// Parse and validate request body
			const body = await request.json();
			const validation = createReviewSchema.safeParse(body);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			// Create review
			const review = await reviewsService.createReview(
				context.user.userId,
				listingId,
				validation.data
			);

			return successResponse({ review }, 201);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes('not found')) {
					return notFoundResponse(error.message);
				}
				if (error.message.includes('unlock') || error.message.includes('already reviewed')) {
					return conflictResponse(error.message);
				}
				if (error.message.includes('permission')) {
					return forbiddenResponse(error.message);
				}
			}
			return serverErrorResponse(error);
		}
	}
);

