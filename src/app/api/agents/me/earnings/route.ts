import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAgent, type AuthContext } from '@/lib/auth/guards';
import * as agentsService from '@/lib/services/agents.service';
import {
	successResponse,
	validationErrorResponse,
	handleError
} from '@/lib/api/response';

const querySchema = z.object({
	months: z.coerce.number().int().min(1).max(12).default(6)
});

/**
 * GET /api/agents/me/earnings
 *
 * Get current agent's earnings history by month
 *
 * Headers: Cookie (access_token, refresh_token)
 * Query Parameters:
 * - months: Number of months to include (default: 6, max: 12)
 *
 * Response: { success, data: { earnings: [{ month, unlocks, amount }] } }
 */
export const GET = withAgent(
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

			const earnings = await agentsService.getAgentEarnings(
				context.user.userId,
				validation.data.months
			);

			return successResponse({ earnings });
		} catch (error) {
			return handleError(error);
		}
	}
);

