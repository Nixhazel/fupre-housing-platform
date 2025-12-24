import { NextRequest } from 'next/server';
import { withOptionalAuth, withAuth, type AuthContext } from '@/lib/auth/guards';
import { updateRoommateListingSchema } from '@/lib/validators/roommates.server';
import * as roommatesService from '@/lib/services/roommates.service';
import {
	successResponse,
	validationErrorResponse,
	notFoundResponse,
	forbiddenResponse,
	handleError
} from '@/lib/api/response';

// Next.js 15 route params type
type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/roommates/[id]
 *
 * Fetch a single roommate listing by ID
 *
 * Path Parameters:
 * - id: Roommate listing ID
 *
 * Response: { success, data: { listing } }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	const handler = withOptionalAuth(
		async () => {
			try {
				const { id: listingId } = await params;

				if (!listingId) {
					return notFoundResponse('Listing ID is required');
				}

				const listingDoc = await roommatesService.getRoommateListingById(listingId, true);
				const listingObj = listingDoc.toObject();

				// Transform the populated owner data
				let owner = null;
				if (listingObj.ownerId && typeof listingObj.ownerId === 'object') {
					const ownerData = listingObj.ownerId as {
						_id: { toString(): string };
						name: string;
						email: string;
						phone?: string;
						avatarUrl?: string;
						role: string;
						isVerified?: boolean;
						createdAt: Date;
					};
					owner = {
						id: ownerData._id.toString(),
						name: ownerData.name,
						email: ownerData.email,
						phone: ownerData.phone,
						avatarUrl: ownerData.avatarUrl,
						role: ownerData.role,
						isVerified: ownerData.isVerified ?? false,
						createdAt: ownerData.createdAt.toISOString()
					};
				}

				// Build response with owner
				const listing = {
					id: listingObj._id.toString(),
					ownerId: typeof listingObj.ownerId === 'object' 
						? (listingObj.ownerId as { _id: { toString(): string } })._id.toString()
						: listingObj.ownerId,
					ownerType: listingObj.ownerType,
					title: listingObj.title,
					budgetMonthly: listingObj.budgetMonthly,
					moveInDate: listingObj.moveInDate.toISOString(),
					description: listingObj.description,
					photos: listingObj.photos,
					preferences: listingObj.preferences,
					createdAt: listingObj.createdAt.toISOString(),
					updatedAt: listingObj.updatedAt.toISOString(),
					owner
				};

				return successResponse({ listing });
			} catch (error) {
				return handleError(error);
			}
		}
	);

	return handler(request);
}

/**
 * PATCH /api/roommates/[id]
 *
 * Update a roommate listing (owner only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Roommate listing ID
 * Body: UpdateRoommateListingInput
 *
 * Response: { success, data: { listing } }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const handler = withAuth(
		async (req: NextRequest, context: AuthContext) => {
			try {
				const { id: listingId } = await params;

				if (!listingId) {
					return notFoundResponse('Listing ID is required');
				}

				const body = await req.json();
				const validation = updateRoommateListingSchema.safeParse(body);

				if (!validation.success) {
					return validationErrorResponse(validation.error);
				}

				const listing = await roommatesService.updateRoommateListing(
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
				return handleError(error);
			}
		}
	);

	return handler(request);
}

/**
 * DELETE /api/roommates/[id]
 *
 * Delete (soft) a roommate listing (owner only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Roommate listing ID
 *
 * Response: { success, data: { message } }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const handler = withAuth(
		async (_req: NextRequest, context: AuthContext) => {
			try {
				const { id: listingId } = await params;

				if (!listingId) {
					return notFoundResponse('Listing ID is required');
				}

				const result = await roommatesService.deleteRoommateListing(
					listingId,
					context.user.userId
				);

				return successResponse(result);
			} catch (error) {
				if (error instanceof Error) {
					if (error.message.includes('not found')) {
						return notFoundResponse(error.message);
					}
					if (error.message.includes('permission')) {
						return forbiddenResponse(error.message);
					}
				}
				return handleError(error);
			}
		}
	);

	return handler(request);
}

