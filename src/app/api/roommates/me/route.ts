import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth, type AuthContext } from '@/lib/auth/guards';
import * as roommatesService from '@/lib/services/roommates.service';
import {
	successResponse,
	validationErrorResponse,
	handleError
} from '@/lib/api/response';

const querySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(20)
});

/**
 * GET /api/roommates/me
 *
 * Get current user's roommate listings
 *
 * Headers: Cookie (access_token, refresh_token)
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 *
 * Response: { success, data: { listings, pagination } }
 */
export const GET = withAuth(
	async (request: NextRequest, context: AuthContext) => {
		try {
			const searchParams = request.nextUrl.searchParams;
			const queryObj: Record<string, string> = {};

			searchParams.forEach((value, key) => {
				queryObj[key] = value;
			});

			const validation = querySchema.safeParse(queryObj);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			const result = await roommatesService.getRoommateListingsByOwner(
				context.user.userId,
				validation.data
			);

			return successResponse(result);
		} catch (error) {
			return handleError(error);
		}
	}
);

