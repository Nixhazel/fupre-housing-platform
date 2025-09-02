import { z } from 'zod';

export const roommateSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.min(5, 'Title must be at least 5 characters')
		.max(100, 'Title must be less than 100 characters'),
	budgetMonthly: z
		.number()
		.min(1, 'Budget is required')
		.min(10000, 'Budget must be at least ₦10,000')
		.max(100000, 'Budget must be less than ₦100,000'),
	preferences: z.object({
		gender: z.enum(['male', 'female', 'any']).optional(),
		cleanliness: z.enum(['low', 'medium', 'high']).optional(),
		studyHours: z.enum(['morning', 'evening', 'night', 'flexible']).optional(),
		smoking: z.enum(['no', 'yes', 'outdoor_only']).optional(),
		pets: z.enum(['no', 'yes']).optional()
	}),
	moveInDate: z
		.string()
		.min(1, 'Move-in date is required')
		.refine((date) => {
			const moveInDate = new Date(date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return moveInDate >= today;
		}, 'Move-in date must be today or in the future'),
	description: z
		.string()
		.min(1, 'Description is required')
		.min(20, 'Description must be at least 20 characters')
		.max(500, 'Description must be less than 500 characters'),
	photos: z
		.array(z.string())
		.min(1, 'Please upload at least one photo')
		.max(5, 'Cannot upload more than 5 photos')
});

export type RoommateFormData = z.infer<typeof roommateSchema>;
