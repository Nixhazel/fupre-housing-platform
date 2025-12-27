import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guards';
import { updateReviewSchema } from '@/lib/validators/reviews.server';
import * as reviewsService from '@/lib/services/reviews.service';
import {
	successResponse,
	validationErrorResponse,
	forbiddenResponse,
	notFoundResponse,
	serverErrorResponse
} from '@/lib/api/response';

// Next.js 15 route params type
type RouteParams = { params: Promise<{ id: string; reviewId: string }> };

/**
 * PATCH /api/listings/[id]/reviews/[reviewId]
 *
 * Update a review (owner only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Listing ID
 * - reviewId: Review ID
 * Body: { rating?, comment? }
 *
 * Response: { success, data: { review } }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const handler = withAuth(
		async (req: NextRequest, context: AuthContext) => {
			try {
				const { reviewId } = await params;

				if (!reviewId) {
					return notFoundResponse('Review ID is required');
				}

				// Parse and validate request body
				const body = await req.json();
				const validation = updateReviewSchema.safeParse(body);

				if (!validation.success) {
					return validationErrorResponse(validation.error);
				}

				// Update review
				const review = await reviewsService.updateReview(
					reviewId,
					context.user.userId,
					validation.data
				);

				return successResponse({ review });
			} catch (error) {
				if (error instanceof Error) {
					if (error.message.includes('not found')) {
						return notFoundResponse(error.message);
					}
					if (error.message.includes('permission')) {
						return forbiddenResponse(error.message);
					}
				}
				return serverErrorResponse(error);
			}
		}
	);

	return handler(request);
}

/**
 * DELETE /api/listings/[id]/reviews/[reviewId]
 *
 * Delete a review (owner only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Listing ID
 * - reviewId: Review ID
 *
 * Response: { success, data: { message } }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const handler = withAuth(
		async (_req: NextRequest, context: AuthContext) => {
			try {
				const { reviewId } = await params;

				if (!reviewId) {
					return notFoundResponse('Review ID is required');
				}

				// Delete review
				await reviewsService.deleteReview(reviewId, context.user.userId);

				return successResponse({ message: 'Review deleted successfully' });
			} catch (error) {
				if (error instanceof Error) {
					if (error.message.includes('not found')) {
						return notFoundResponse(error.message);
					}
					if (error.message.includes('permission')) {
						return forbiddenResponse(error.message);
					}
				}
				return serverErrorResponse(error);
			}
		}
	);

	return handler(request);
}

