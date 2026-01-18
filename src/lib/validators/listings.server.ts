import { z } from 'zod';
import { UNIVERSITY_IDS, isValidLocationForUniversity } from '@/lib/config/universities';

/**
 * Server-side Listing Validators
 *
 * Zod schemas for listing API validation
 */

// University enum
export const universityEnum = z.enum(UNIVERSITY_IDS);

// Listing status enum
export const listingStatusEnum = z.enum(['available', 'taken']);

// Property type enum
export const propertyTypeEnum = z.enum([
	'bedsitter',
	'self-con',
	'1-bedroom',
	'2-bedroom',
	'3-bedroom'
]);

// Availability status enum
export const availabilityStatusEnum = z.enum([
	'available_now',
	'available_soon'
]);

// Predefined amenities enum
export const amenitiesEnum = z.enum([
	'Water',
	'Light (Electricity)',
	'Tiles',
	'POP Ceiling',
	'PVC Ceiling',
	'Fenced Compound',
	'Gated Compound',
	'Wardrobe',
	'Landlord in Compound',
	'Landlord Not in Compound',
	'Private Balcony',
	'Upstairs',
	'Downstairs'
]);

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

	university: universityEnum,

	location: z
		.string()
		.min(2, 'Location must be at least 2 characters')
		.max(50, 'Location cannot exceed 50 characters')
		.transform((v) => v.trim()),

	propertyType: propertyTypeEnum,

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

	priceYearly: z
		.number()
		.min(50000, 'Yearly rent must be at least ₦50,000')
		.max(5000000, 'Yearly rent cannot exceed ₦5,000,000'),

	bedrooms: z
		.number()
		.int()
		.min(0, 'Bedrooms cannot be negative')
		.max(5, 'Cannot exceed 5 bedrooms'),

	bathrooms: z
		.number()
		.int()
		.min(1, 'Must have at least 1 bathroom')
		.max(4, 'Cannot exceed 4 bathrooms'),

	walkingMinutes: z
		.number()
		.int()
		.min(1, 'Walking time must be at least 1 minute')
		.max(120, 'Walking time cannot exceed 120 minutes'),

	amenities: z
		.array(amenitiesEnum)
		.min(1, 'Must have at least 1 amenity')
		.max(13, 'Cannot exceed 13 amenities'),

	availabilityStatus: availabilityStatusEnum.default('available_now'),

	availableFrom: z
		.string()
		.datetime()
		.optional()
		.refine(
			(val) => !val || new Date(val) > new Date(),
			'Available from date must be in the future'
		),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Must have at least 1 photo')
		.max(10, 'Cannot exceed 10 photos'),

	videos: z
		.array(z.string().url('Each video must be a valid URL'))
		.max(3, 'Cannot exceed 3 videos')
		.default([]),

	coverPhoto: z.string().url('Cover photo must be a valid URL'),

	mapPreview: z.string().url('Map preview must be a valid URL'),

	mapFull: z.string().url('Full map must be a valid URL'),

	// Landlord/Caretaker contact (required for ISA)
	landlordName: z
		.string()
		.max(100, 'Landlord name cannot exceed 100 characters')
		.transform((v) => v.trim())
		.optional(),

	landlordPhone: z
		.string()
		.regex(/^\+234\d{10}$/, 'Please enter a valid Nigerian phone number')
		.optional()
}).refine(
	(data) => isValidLocationForUniversity(data.university, data.location),
	{
		message: 'Invalid location for the selected university',
		path: ['location']
	}
).refine(
	(data) => {
		// If available_soon, require availableFrom date
		if (data.availabilityStatus === 'available_soon') {
			return !!data.availableFrom;
		}
		return true;
	},
	{
		message: 'Please specify when the property will be available',
		path: ['availableFrom']
	}
);

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

	university: universityEnum.optional(),

	location: z
		.string()
		.min(2, 'Location must be at least 2 characters')
		.max(50, 'Location cannot exceed 50 characters')
		.transform((v) => v.trim())
		.optional(),

	propertyType: propertyTypeEnum.optional(),

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

	priceYearly: z
		.number()
		.min(50000, 'Yearly rent must be at least ₦50,000')
		.max(5000000, 'Yearly rent cannot exceed ₦5,000,000')
		.optional(),

	bedrooms: z
		.number()
		.int()
		.min(0, 'Bedrooms cannot be negative')
		.max(5, 'Cannot exceed 5 bedrooms')
		.optional(),

	bathrooms: z
		.number()
		.int()
		.min(1, 'Must have at least 1 bathroom')
		.max(4, 'Cannot exceed 4 bathrooms')
		.optional(),

	walkingMinutes: z
		.number()
		.int()
		.min(1, 'Walking time must be at least 1 minute')
		.max(120, 'Walking time cannot exceed 120 minutes')
		.optional(),

	amenities: z
		.array(amenitiesEnum)
		.min(1, 'Must have at least 1 amenity')
		.max(13, 'Cannot exceed 13 amenities')
		.optional(),

	availabilityStatus: availabilityStatusEnum.optional(),

	availableFrom: z
		.string()
		.datetime()
		.optional(),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Must have at least 1 photo')
		.max(10, 'Cannot exceed 10 photos')
		.optional(),

	videos: z
		.array(z.string().url('Each video must be a valid URL'))
		.max(3, 'Cannot exceed 3 videos')
		.optional(),

	coverPhoto: z.string().url('Cover photo must be a valid URL').optional(),

	mapPreview: z.string().url('Map preview must be a valid URL').optional(),

	mapFull: z.string().url('Full map must be a valid URL').optional(),

	landlordName: z
		.string()
		.max(100, 'Landlord name cannot exceed 100 characters')
		.transform((v) => v.trim())
		.optional(),

	landlordPhone: z
		.string()
		.regex(/^\+234\d{10}$/, 'Please enter a valid Nigerian phone number')
		.optional(),

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
	university: universityEnum.optional(),
	location: z.string().optional(),
	propertyType: propertyTypeEnum.optional(),
	minPrice: z.coerce.number().min(0).optional(),
	maxPrice: z.coerce.number().max(10000000).optional(),
	bedrooms: z.coerce.number().int().min(0).max(5).optional(),
	bathrooms: z.coerce.number().int().min(1).max(4).optional(),
	availabilityStatus: availabilityStatusEnum.optional(),
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
