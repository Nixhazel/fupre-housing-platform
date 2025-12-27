import { z } from 'zod';

/**
 * Server-side Listing Validators
 *
 * Zod schemas for listing API validation
 */

// Campus areas enum
export const campusAreaEnum = z.enum([
	'Ugbomro',
	'Effurun',
	'Enerhen',
	'PTI Road',
	'Other'
]);

// Listing status enum
export const listingStatusEnum = z.enum(['available', 'taken']);

// Sort options
export const sortByEnum = z.enum([
	'newest',
	'oldest',
	'price_low',
	'price_high',
	'rating',
	'views'
]);

/**
 * Create listing schema
 */
export const createListingSchema = z.object({
	title: z
		.string()
		.min(5, 'Title must be at least 5 characters')
		.max(100, 'Title cannot exceed 100 characters')
		.transform((v) => v.trim()),

	description: z
		.string()
		.min(20, 'Description must be at least 20 characters')
		.max(1000, 'Description cannot exceed 1000 characters')
		.transform((v) => v.trim()),

	campusArea: campusAreaEnum,

	addressApprox: z
		.string()
		.min(5, 'Approximate address must be at least 5 characters')
		.max(200, 'Approximate address cannot exceed 200 characters')
		.transform((v) => v.trim()),

	addressFull: z
		.string()
		.min(10, 'Full address must be at least 10 characters')
		.max(300, 'Full address cannot exceed 300 characters')
		.transform((v) => v.trim()),

	priceMonthly: z
		.number()
		.min(5000, 'Price must be at least ₦5,000')
		.max(500000, 'Price cannot exceed ₦500,000'),

	bedrooms: z
		.number()
		.int()
		.min(1, 'Must have at least 1 bedroom')
		.max(5, 'Cannot exceed 5 bedrooms'),

	bathrooms: z
		.number()
		.int()
		.min(1, 'Must have at least 1 bathroom')
		.max(4, 'Cannot exceed 4 bathrooms'),

	distanceToCampusKm: z
		.number()
		.min(0.1, 'Distance must be at least 0.1km')
		.max(20, 'Distance cannot exceed 20km'),

	amenities: z
		.array(z.string())
		.min(1, 'Must have at least 1 amenity')
		.max(10, 'Cannot exceed 10 amenities'),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Must have at least 1 photo')
		.max(10, 'Cannot exceed 10 photos'),

	coverPhoto: z.string().url('Cover photo must be a valid URL'),

	mapPreview: z.string().url('Map preview must be a valid URL'),

	mapFull: z.string().url('Full map must be a valid URL')
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

/**
 * Update listing schema (all fields optional)
 */
export const updateListingSchema = z.object({
	title: z
		.string()
		.min(5, 'Title must be at least 5 characters')
		.max(100, 'Title cannot exceed 100 characters')
		.transform((v) => v.trim())
		.optional(),

	description: z
		.string()
		.min(20, 'Description must be at least 20 characters')
		.max(1000, 'Description cannot exceed 1000 characters')
		.transform((v) => v.trim())
		.optional(),

	campusArea: campusAreaEnum.optional(),

	addressApprox: z
		.string()
		.min(5, 'Approximate address must be at least 5 characters')
		.max(200, 'Approximate address cannot exceed 200 characters')
		.transform((v) => v.trim())
		.optional(),

	addressFull: z
		.string()
		.min(10, 'Full address must be at least 10 characters')
		.max(300, 'Full address cannot exceed 300 characters')
		.transform((v) => v.trim())
		.optional(),

	priceMonthly: z
		.number()
		.min(5000, 'Price must be at least ₦5,000')
		.max(500000, 'Price cannot exceed ₦500,000')
		.optional(),

	bedrooms: z
		.number()
		.int()
		.min(1, 'Must have at least 1 bedroom')
		.max(5, 'Cannot exceed 5 bedrooms')
		.optional(),

	bathrooms: z
		.number()
		.int()
		.min(1, 'Must have at least 1 bathroom')
		.max(4, 'Cannot exceed 4 bathrooms')
		.optional(),

	distanceToCampusKm: z
		.number()
		.min(0.1, 'Distance must be at least 0.1km')
		.max(20, 'Distance cannot exceed 20km')
		.optional(),

	amenities: z
		.array(z.string())
		.min(1, 'Must have at least 1 amenity')
		.max(10, 'Cannot exceed 10 amenities')
		.optional(),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Must have at least 1 photo')
		.max(10, 'Cannot exceed 10 photos')
		.optional(),

	coverPhoto: z.string().url('Cover photo must be a valid URL').optional(),

	mapPreview: z.string().url('Map preview must be a valid URL').optional(),

	mapFull: z.string().url('Full map must be a valid URL').optional(),

	status: listingStatusEnum.optional()
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>;

/**
 * Query parameters for listing list
 */
export const listingQuerySchema = z.object({
	// Pagination
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(12),

	// Search
	search: z.string().optional(),

	// Filters
	campusArea: campusAreaEnum.optional(),
	minPrice: z.coerce.number().min(0).optional(),
	maxPrice: z.coerce.number().max(1000000).optional(),
	bedrooms: z.coerce.number().int().min(1).max(5).optional(),
	bathrooms: z.coerce.number().int().min(1).max(4).optional(),
	status: listingStatusEnum.optional(),
	agentId: z.string().optional(),
	verifiedAgentsOnly: z
		.enum(['true', 'false'])
		.optional()
		.transform((v) => v === 'true'),

	// Sorting
	sortBy: sortByEnum.default('newest')
});

export type ListingQueryInput = z.infer<typeof listingQuerySchema>;

/**
 * Mark listing as taken/available schema
 */
export const updateStatusSchema = z.object({
	status: listingStatusEnum
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

