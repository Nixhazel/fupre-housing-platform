import { z } from 'zod';

/**
 * Server-side Review Validators
 *
 * Zod schemas for review API validation
 */

/**
 * Create review schema
 */
export const createReviewSchema = z.object({
	rating: z
		.number()
		.int('Rating must be a whole number')
		.min(1, 'Rating must be at least 1')
		.max(5, 'Rating cannot exceed 5'),
	comment: z
		.string()
		.min(10, 'Review must be at least 10 characters')
		.max(500, 'Review cannot exceed 500 characters')
		.transform(v => v.trim())
});

/**
 * Update review schema
 */
export const updateReviewSchema = z.object({
	rating: z
		.number()
		.int('Rating must be a whole number')
		.min(1, 'Rating must be at least 1')
		.max(5, 'Rating cannot exceed 5')
		.optional(),
	comment: z
		.string()
		.min(10, 'Review must be at least 10 characters')
		.max(500, 'Review cannot exceed 500 characters')
		.transform(v => v.trim())
		.optional()
}).refine(data => data.rating !== undefined || data.comment !== undefined, {
	message: 'At least one field (rating or comment) must be provided'
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

