import { NextRequest } from 'next/server';
import { withAgent, type AuthContext } from '@/lib/auth/guards';
import * as agentsService from '@/lib/services/agents.service';
import { successResponse, handleError } from '@/lib/api/response';

/**
 * GET /api/agents/me/stats
 *
 * Get current agent's dashboard stats
 *
 * Headers: Cookie (access_token, refresh_token)
 * Response: { success, data: { totalListings, activeListings, totalViews, totalUnlocks, totalEarnings } }
 */
export const GET = withAgent(
	async (_request: NextRequest, context: AuthContext) => {
		try {
			const stats = await agentsService.getAgentStats(context.user.userId);

			return successResponse(stats);
		} catch (error) {
			return handleError(error);
		}
	}
);

