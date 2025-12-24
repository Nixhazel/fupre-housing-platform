import { NextRequest } from 'next/server';
import { withAuth, withAdmin, type AuthContext } from '@/lib/auth/guards';
import { reviewPaymentProofSchema } from '@/lib/validators/payments.server';
import * as paymentsService from '@/lib/services/payments.service';
import {
	successResponse,
	validationErrorResponse,
	notFoundResponse,
	handleError
} from '@/lib/api/response';

// Next.js 15 route params type
type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/payments/proofs/[id]
 *
 * Get a single payment proof by ID
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Payment proof ID
 *
 * Response: { success, data: { proof } }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	const handler = withAuth(
		async (_req: NextRequest, context: AuthContext) => {
			try {
				const { id: proofId } = await params;

				if (!proofId) {
					return notFoundResponse('Proof ID is required');
				}

				const proof = await paymentsService.getPaymentProofById(
					proofId,
					context.user.userId,
					context.user.role
				);

				return successResponse({ proof });
			} catch (error) {
				return handleError(error);
			}
		}
	);

	return handler(request);
}

/**
 * PATCH /api/payments/proofs/[id]
 *
 * Review (approve/reject) a payment proof (admin only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: Payment proof ID
 * Body: { status: 'approved' | 'rejected', rejectionReason?: string }
 *
 * Response: { success, data: { proof } }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const handler = withAdmin(
		async (req: NextRequest, context: AuthContext) => {
			try {
				const { id: proofId } = await params;

				if (!proofId) {
					return notFoundResponse('Proof ID is required');
				}

				const body = await req.json();
				const validation = reviewPaymentProofSchema.safeParse(body);

				if (!validation.success) {
					return validationErrorResponse(validation.error);
				}

				const proof = await paymentsService.reviewPaymentProof(
					proofId,
					context.user.userId,
					validation.data
				);

				return successResponse({ proof });
			} catch (error) {
				return handleError(error);
			}
		}
	);

	return handler(request);
}

