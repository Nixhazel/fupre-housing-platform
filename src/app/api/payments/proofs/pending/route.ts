import { NextRequest } from 'next/server';
import { withAdmin, type AuthContext } from '@/lib/auth/guards';
import { paymentProofsQuerySchema } from '@/lib/validators/payments.server';
import * as paymentsService from '@/lib/services/payments.service';
import {
	successResponse,
	validationErrorResponse,
	handleError
} from '@/lib/api/response';

/**
 * GET /api/payments/proofs/pending
 *
 * Get all pending payment proofs (admin only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 *
 * Response: { success, data: { proofs, pagination } }
 */
export const GET = withAdmin(
	async (request: NextRequest, _context: AuthContext) => {
		try {
			const searchParams = request.nextUrl.searchParams;
			const queryObj: Record<string, string> = {};

			searchParams.forEach((value, key) => {
				queryObj[key] = value;
			});

			const validation = paymentProofsQuerySchema.safeParse(queryObj);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			const result = await paymentsService.getPendingPaymentProofs({
				page: validation.data.page,
				limit: validation.data.limit
			});

			return successResponse(result);
		} catch (error) {
			return handleError(error);
		}
	}
);

