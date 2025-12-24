import { NextRequest } from 'next/server';
import { withAdmin, type AuthContext } from '@/lib/auth/guards';
import * as adminService from '@/lib/services/admin.service';
import { successResponse, handleError } from '@/lib/api/response';

/**
 * GET /api/admin/stats
 *
 * Get platform-wide statistics (admin only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Response: { success, data: { totalUsers, usersByRole, totalListings, ... } }
 */
export const GET = withAdmin(
	async (_request: NextRequest, _context: AuthContext) => {
		try {
			const stats = await adminService.getPlatformStats();

			return successResponse(stats);
		} catch (error) {
			return handleError(error);
		}
	}
);

