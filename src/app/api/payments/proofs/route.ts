import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guards';
import {
	submitPaymentProofSchema,
	paymentProofsQuerySchema
} from '@/lib/validators/payments.server';
import * as paymentsService from '@/lib/services/payments.service';
import {
	successResponse,
	validationErrorResponse,
	handleError
} from '@/lib/api/response';

/**
 * POST /api/payments/proofs
 *
 * Submit a new payment proof
 *
 * Headers: Cookie (access_token, refresh_token)
 * Body: { listingId, amount, method, reference, imageUrl }
 * Response: { success, data: { proof } }
 */
export const POST = withAuth(
	async (request: NextRequest, context: AuthContext) => {
		try {
			const body = await request.json();
			const validation = submitPaymentProofSchema.safeParse(body);

			if (!validation.success) {
				return validationErrorResponse(validation.error);
			}

			const proof = await paymentsService.submitPaymentProof(
				context.user.userId,
				validation.data
			);

			return successResponse({ proof }, 201);
		} catch (error) {
			return handleError(error);
		}
	}
);

/**
 * GET /api/payments/proofs
 *
 * Get current user's payment proofs
 *
 * Headers: Cookie (access_token, refresh_token)
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 * - status: Filter by status (pending/approved/rejected)
 *
 * Response: { success, data: { proofs, pagination } }
 */
export const GET = withAuth(
	async (request: NextRequest, context: AuthContext) => {
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

			const result = await paymentsService.getUserPaymentProofs(
				context.user.userId,
				validation.data
			);

			return successResponse(result);
		} catch (error) {
			return handleError(error);
		}
	}
);

