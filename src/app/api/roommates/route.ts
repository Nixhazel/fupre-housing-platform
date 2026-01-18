import { NextRequest } from 'next/server';
import { withAuth, withOptionalAuth, type AuthContext } from '@/lib/auth/guards';
import {
	createRoommateListingSchema,
	roommateQuerySchema
} from '@/lib/validators/roommates.server';
import * as roommatesService from '@/lib/services/roommates.service';
import {
	successResponse,
	validationErrorResponse,
	forbiddenResponse,
	handleError
} from '@/lib/api/response';

/**
 * GET /api/roommates
 *
 * Fetch roommate listings with optional filters and pagination
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 50)
 * - search: Text search
 * - minBudget: Minimum budget
 * - maxBudget: Maximum budget
 * - gender: Gender preference filter
 * - cleanliness: Cleanliness preference filter
 * - sortBy: Sort order (newest, oldest, budget_low, budget_high)
 *
 * Response: { success, data: { listings, pagination } }
 */
export const GET = withOptionalAuth(
	async (request: NextRequest) => {
		try {
			const searchParams = request.nextUrl.searchParams;
			const queryObj: Record<string, string> = {};

			searchParams.forEach((value, key) => {
				queryObj[key] = value;
			});

			const validation = roommateQuerySchema.safeParse(queryObj);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			const result = await roommatesService.getRoommateListings(validation.data);

			return successResponse(result);
		} catch (error) {
			return handleError(error);
		}
	}
);

/**
 * POST /api/roommates
 *
 * Create a new roommate listing (student or owner only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Body: CreateRoommateListingInput
 * Response: { success, data: { listing } }
 */
export const POST = withAuth(
	async (request: NextRequest, context: AuthContext) => {
		try {
			// Check role - only students and owners can create roommate listings
			if (!['student', 'owner'].includes(context.user.role)) {
				return forbiddenResponse('Only students and property owners can create roommate listings');
			}

			const body = await request.json();
			const validation = createRoommateListingSchema.safeParse(body);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			const listing = await roommatesService.createRoommateListing(
				context.user.userId,
				validation.data
			);

			return successResponse({ listing }, 201);
		} catch (error) {
			return handleError(error);
		}
	}
);

