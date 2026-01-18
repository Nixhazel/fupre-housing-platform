import { z } from 'zod';

/**
 * Client-side Review Validators
 *
 * Zod schemas for review form validation
 */

export const createReviewSchema = z.object({
	rating: z
		.number()
		.min(1, 'Rating must be at least 1 star')
		.max(5, 'Rating cannot exceed 5 stars'),
	comment: z
		.string()
		.min(10, 'Review must be at least 10 characters')
		.max(500, 'Review cannot exceed 500 characters')
});

export const updateReviewSchema = z.object({
	rating: z
		.number()
		.min(1, 'Rating must be at least 1 star')
		.max(5, 'Rating cannot exceed 5 stars')
		.optional(),
	comment: z
		.string()
		.min(10, 'Review must be at least 10 characters')
		.max(500, 'Review cannot exceed 500 characters')
		.optional()
}).refine(data => data.rating !== undefined || data.comment !== undefined, {
	message: 'At least one field must be provided'
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>;

