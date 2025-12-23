import { NextRequest } from 'next/server';
import { withAgent, type AuthContext } from '@/lib/auth/guards';
import { updateStatusSchema } from '@/lib/validators/listings.server';
import * as listingsService from '@/lib/services/listings.service';
import {
	successResponse,
	validationErrorResponse,
	notFoundResponse,
	forbiddenResponse,
	serverErrorResponse
} from '@/lib/api/response';

// Next.js 15 route params type
type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/listings/[id]/status
 *
 * Update listing status (mark as taken/available)
 * Agent only, must own the listing
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Listing ID
 * Body: { status: 'available' | 'taken' }
 *
 * Response: { success, data: { listing } }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const handler = withAgent(
		async (req: NextRequest, context: AuthContext) => {
			try {
				const { id: listingId } = await params;

				if (!listingId) {
					return notFoundResponse('Listing ID is required');
				}

				// Parse and validate request body
				const body = await req.json();
				const validation = updateStatusSchema.safeParse(body);

				if (!validation.success) {
					return validationErrorResponse(validation.error);
				}

				// Update status
				const listing = await listingsService.updateListingStatus(
					listingId,
					context.user.userId,
					validation.data.status
				);

				return successResponse({ listing });
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

