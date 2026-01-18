import { z } from 'zod';

/**
 * Server-side Roommate Validators
 *
 * Zod schemas for roommate listing API validation
 */

// Preference enums
export const genderPreferenceEnum = z.enum(['male', 'female', 'any']);
export const cleanlinessPreferenceEnum = z.enum(['low', 'medium', 'high']);
export const studyHoursPreferenceEnum = z.enum(['morning', 'evening', 'night', 'flexible']);
export const smokingPreferenceEnum = z.enum(['no', 'yes', 'outdoor_only']);
export const petsPreferenceEnum = z.enum(['no', 'yes']);

// Preferences schema
const preferencesSchema = z.object({
	gender: genderPreferenceEnum.optional(),
	cleanliness: cleanlinessPreferenceEnum.optional(),
	studyHours: studyHoursPreferenceEnum.optional(),
	smoking: smokingPreferenceEnum.optional(),
	pets: petsPreferenceEnum.optional()
});

/**
 * Create roommate listing schema
 */
export const createRoommateListingSchema = z.object({
	title: z
		.string()
		.min(5, 'Title must be at least 5 characters')
		.max(100, 'Title cannot exceed 100 characters')
		.transform((v) => v.trim()),

	budgetMonthly: z
		.number()
		.min(10000, 'Budget must be at least ₦10,000')
		.max(100000, 'Budget cannot exceed ₦100,000'),

	moveInDate: z
		.string()
		.min(1, 'Move-in date is required')
		.refine((date) => {
			const moveIn = new Date(date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return moveIn >= today;
		}, 'Move-in date must be today or in the future'),

	description: z
		.string()
		.min(20, 'Description must be at least 20 characters')
		.max(500, 'Description cannot exceed 500 characters')
		.transform((v) => v.trim()),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Must have at least 1 photo')
		.max(5, 'Cannot exceed 5 photos'),

	preferences: preferencesSchema.default({})
});

export type CreateRoommateListingInput = z.infer<typeof createRoommateListingSchema>;

/**
 * Update roommate listing schema (all fields optional)
 */
export const updateRoommateListingSchema = z.object({
	title: z
		.string()
		.min(5, 'Title must be at least 5 characters')
		.max(100, 'Title cannot exceed 100 characters')
		.transform((v) => v.trim())
		.optional(),

	budgetMonthly: z
		.number()
		.min(10000, 'Budget must be at least ₦10,000')
		.max(100000, 'Budget cannot exceed ₦100,000')
		.optional(),

	moveInDate: z
		.string()
		.refine((date) => {
			const moveIn = new Date(date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return moveIn >= today;
		}, 'Move-in date must be today or in the future')
		.optional(),

	description: z
		.string()
		.min(20, 'Description must be at least 20 characters')
		.max(500, 'Description cannot exceed 500 characters')
		.transform((v) => v.trim())
		.optional(),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Must have at least 1 photo')
		.max(5, 'Cannot exceed 5 photos')
		.optional(),

	preferences: preferencesSchema.optional()
});

export type UpdateRoommateListingInput = z.infer<typeof updateRoommateListingSchema>;

/**
 * Query parameters for roommate listings
 */
export const roommateQuerySchema = z.object({
	// Pagination
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(12),

	// Search
	search: z.string().optional(),

	// Filters
	minBudget: z.coerce.number().min(0).optional(),
	maxBudget: z.coerce.number().max(200000).optional(),
	gender: genderPreferenceEnum.optional(),
	cleanliness: cleanlinessPreferenceEnum.optional(),

	// Sorting
	sortBy: z.enum(['newest', 'oldest', 'budget_low', 'budget_high']).default('newest')
});

export type RoommateQueryInput = z.infer<typeof roommateQuerySchema>;

