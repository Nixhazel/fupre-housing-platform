import { NextRequest } from 'next/server';
import {
	withOptionalAuth,
	withAgent,
	type AuthContext
} from '@/lib/auth/guards';
import { updateListingSchema } from '@/lib/validators/listings.server';
import * as listingsService from '@/lib/services/listings.service';
import {
	successResponse,
	validationErrorResponse,
	notFoundResponse,
	forbiddenResponse,
	serverErrorResponse
} from '@/lib/api/response';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

// Next.js 15 route params type
type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/listings/[id]
 *
 * Fetch a single listing by ID
 *
 * Access levels:
 * - Admins: Always see full unlocked listing
 * - Agents: See their own listings as unlocked
 * - Users with unlocked listing: See full details
 * - Others: See public listing only
 *
 * Path Parameters:
 * - id: Listing ID
 *
 * Response: { success, data: { listing, isUnlocked } }
 */
export const GET = withOptionalAuth(
	async (request: NextRequest, context: AuthContext | null) => {
		try {
			// Get listing ID from URL
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			const listingId = pathParts[pathParts.length - 1];

			if (!listingId) {
				return notFoundResponse('Listing ID is required');
			}

			await connectDB();

			// First, get the listing to check ownership
			const listingData = await listingsService.getListingById(listingId);
			if (!listingData) {
				return notFoundResponse('Listing not found');
			}

			// Check if user has access to unlocked info
			let isUnlocked = false;

			if (context?.user) {
				const user = await User.findActiveById(context.user.userId);
				if (user) {
					// Admins always have access
					if (user.role === 'admin') {
						isUnlocked = true;
					}
					// Agents have access to their own listings
					else if (
						user.role === 'agent' &&
						listingData.agentId === context.user.userId
					) {
						isUnlocked = true;
					}
					// Check if user has paid to unlock
					else {
						isUnlocked = user.unlockedListingIds.some(
							(id) => id.toString() === listingId
						);
					}
				}
			}

			// Fetch listing based on unlock status
			if (isUnlocked) {
				const listing = await listingsService.getUnlockedListing(listingId);
				if (!listing) {
					return notFoundResponse('Listing not found');
				}
				return successResponse({ listing, isUnlocked: true });
			} else {
				return successResponse({ listing: listingData, isUnlocked: false });
			}
		} catch (error) {
			return serverErrorResponse(error);
		}
	}
);

/**
 * PATCH /api/listings/[id]
 *
 * Update a listing (agent only, must own the listing)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Listing ID
 * Body: UpdateListingInput
 *
 * Response: { success, data: { listing } }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	// Wrap with agent guard
	const handler = withAgent(async (req: NextRequest, context: AuthContext) => {
		try {
			const { id: listingId } = await params;

			if (!listingId) {
				return notFoundResponse('Listing ID is required');
			}

			// Parse and validate request body
			const body = await req.json();
			const validation = updateListingSchema.safeParse(body);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			// Update listing
			const listing = await listingsService.updateListing(
				listingId,
				context.user.userId,
				validation.data
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
	});

	return handler(request);
}

/**
 * DELETE /api/listings/[id]
 *
 * Soft delete a listing (agent only, must own the listing)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Listing ID
 *
 * Response: { success, data: { message } }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const handler = withAgent(async (_req: NextRequest, context: AuthContext) => {
		try {
			const { id: listingId } = await params;

			if (!listingId) {
				return notFoundResponse('Listing ID is required');
			}

			// Delete listing
			await listingsService.deleteListing(listingId, context.user.userId);

			return successResponse({ message: 'Listing deleted successfully' });
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
	});

	return handler(request);
}
