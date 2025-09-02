import { z } from 'zod';

export const paymentProofSchema = z.object({
	amount: z
		.number()
		.min(1000, 'Amount must be exactly ₦1,000')
		.max(1000, 'Amount must be exactly ₦1,000'),
	method: z.enum(['bank_transfer', 'ussd', 'pos']),
	reference: z
		.string()
		.min(1, 'Transaction reference is required')
		.min(5, 'Reference must be at least 5 characters')
		.max(50, 'Reference must be less than 50 characters'),
	imageUrl: z.string().min(1, 'Please upload a payment receipt')
});

export type PaymentProofFormData = z.infer<typeof paymentProofSchema>;
