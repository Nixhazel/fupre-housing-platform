import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAdmin } from '@/lib/auth/guards';
import * as adminService from '@/lib/services/admin.service';
import {
	successResponse,
	validationErrorResponse,
	handleError
} from '@/lib/api/response';

const querySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	role: z.enum(['student', 'agent', 'owner', 'admin']).optional(),
	search: z.string().optional(),
	verified: z.enum(['true', 'false']).optional().transform((v) => {
		if (v === 'true') return true;
		if (v === 'false') return false;
		return undefined;
	})
});

/**
 * GET /api/admin/users
 *
 * Get paginated list of users (admin only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - role: Filter by role
 * - search: Search by name or email
 * - verified: Filter by verification status
 *
 * Response: { success, data: { users, pagination } }
 */
export const GET = withAdmin(
	async (request: NextRequest) => {
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

			const result = await adminService.getUsers(validation.data);

			return successResponse(result);
		} catch (error) {
			return handleError(error);
		}
	}
);

