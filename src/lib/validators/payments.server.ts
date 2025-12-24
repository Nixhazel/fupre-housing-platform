import { z } from 'zod';

/**
 * Server-side Payment Validators
 *
 * Zod schemas for payment proof API validation
 */

// Payment method enum
export const paymentMethodEnum = z.enum(['bank_transfer', 'ussd', 'pos']);

// Payment status enum
export const paymentStatusEnum = z.enum(['pending', 'approved', 'rejected']);

/**
 * Submit payment proof schema
 */
export const submitPaymentProofSchema = z.object({
	listingId: z.string().min(1, 'Listing ID is required'),

	amount: z
		.number()
		.min(1000, 'Amount must be exactly ₦1,000')
		.max(1000, 'Amount must be exactly ₦1,000')
		.default(1000),

	method: paymentMethodEnum,

	reference: z
		.string()
		.min(5, 'Reference must be at least 5 characters')
		.max(50, 'Reference cannot exceed 50 characters')
		.transform((v) => v.trim()),

	imageUrl: z.string().url('Please provide a valid image URL')
});

export type SubmitPaymentProofInput = z.infer<typeof submitPaymentProofSchema>;

/**
 * Review payment proof schema (admin)
 */
export const reviewPaymentProofSchema = z.object({
	status: z.enum(['approved', 'rejected'], {
		message: 'Status must be approved or rejected'
	}),

	rejectionReason: z
		.string()
		.min(10, 'Rejection reason must be at least 10 characters')
		.max(500, 'Rejection reason cannot exceed 500 characters')
		.optional()
}).refine(
	(data) => {
		// If rejected, rejectionReason is required
		if (data.status === 'rejected' && !data.rejectionReason) {
			return false;
		}
		return true;
	},
	{
		message: 'Rejection reason is required when rejecting a proof',
		path: ['rejectionReason']
	}
);

export type ReviewPaymentProofInput = z.infer<typeof reviewPaymentProofSchema>;

/**
 * Query parameters for payment proofs list
 */
export const paymentProofsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	status: paymentStatusEnum.optional(),
	listingId: z.string().optional()
});

export type PaymentProofsQueryInput = z.infer<typeof paymentProofsQuerySchema>;

