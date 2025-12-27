import { z } from 'zod';
import { PLATFORM_CONFIG } from '@/lib/config/env';

const UNLOCK_FEE = PLATFORM_CONFIG.UNLOCK_FEE;

export const paymentProofSchema = z.object({
	amount: z
		.number()
		.min(UNLOCK_FEE, `Amount must be exactly ₦${UNLOCK_FEE.toLocaleString()}`)
		.max(UNLOCK_FEE, `Amount must be exactly ₦${UNLOCK_FEE.toLocaleString()}`),
	method: z.enum(['bank_transfer', 'ussd', 'pos']),
	reference: z
		.string()
		.min(1, 'Transaction reference is required')
		.min(5, 'Reference must be at least 5 characters')
		.max(50, 'Reference must be less than 50 characters'),
	imageUrl: z.string().min(1, 'Please upload a payment receipt')
});

export type PaymentProofFormData = z.infer<typeof paymentProofSchema>;
