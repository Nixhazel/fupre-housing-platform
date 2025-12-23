import { NextRequest } from 'next/server';
import { withAgent, withOptionalAuth, type AuthContext } from '@/lib/auth/guards';
import {
	createListingSchema,
	listingQuerySchema
} from '@/lib/validators/listings.server';
import * as listingsService from '@/lib/services/listings.service';
import {
	successResponse,
	validationErrorResponse,
	serverErrorResponse
} from '@/lib/api/response';

/**
 * GET /api/listings
 *
 * Fetch paginated listings with optional filters
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 50)
 * - search: Text search
 * - campusArea: Filter by campus area
 * - minPrice: Minimum price
 * - maxPrice: Maximum price
 * - bedrooms: Filter by bedroom count
 * - bathrooms: Filter by bathroom count
 * - status: Filter by status (available/taken)
 * - agentId: Filter by agent
 * - sortBy: Sort order (newest, oldest, price_low, price_high, rating, views)
 *
 * Response: { success, data: { listings, pagination } }
 */
export const GET = withOptionalAuth(
	async (request: NextRequest) => {
		try {
			// Parse query parameters
			const searchParams = request.nextUrl.searchParams;
			const queryObj: Record<string, string> = {};

			searchParams.forEach((value, key) => {
				queryObj[key] = value;
			});

			// Validate query parameters
			const validation = listingQuerySchema.safeParse(queryObj);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			// Fetch listings
			const result = await listingsService.getListings(validation.data);

			return successResponse(result);
		} catch (error) {
			return serverErrorResponse(error);
		}
	}
);

/**
 * POST /api/listings
 *
 * Create a new listing (agent only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Body: CreateListingInput
 * Response: { success, data: { listing } }
 */
export const POST = withAgent(
	async (request: NextRequest, context: AuthContext) => {
		try {
			// Parse and validate request body
			const body = await request.json();
			const validation = createListingSchema.safeParse(body);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			// Create listing
			const listing = await listingsService.createListing(
				context.user.userId,
				validation.data
			);

			return successResponse({ listing }, 201);
		} catch (error) {
			return serverErrorResponse(error);
		}
	}
);

