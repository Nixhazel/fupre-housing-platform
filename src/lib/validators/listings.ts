import { z } from 'zod';
import { UNIVERSITY_IDS, getLocationsForUniversity } from '@/lib/config/universities';

/**
 * Client-side Listing Validators
 *
 * Zod schemas for listing form validation
 */

// Property types
export const PROPERTY_TYPES = [
	'bedsitter',
	'self-con',
	'1-bedroom',
	'2-bedroom',
	'3-bedroom'
] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];

// Availability statuses
export const AVAILABILITY_STATUSES = [
	'available_now',
	'available_soon'
] as const;

export type AvailabilityStatusValue = (typeof AVAILABILITY_STATUSES)[number];

// Predefined amenities (updated list)
export const AMENITIES_OPTIONS = [
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
] as const;

export type AmenityValue = (typeof AMENITIES_OPTIONS)[number];

/**
 * Create/Edit listing form schema
 */
export const listingFormSchema = z.object({
	title: z
		.string()
		.min(5, 'Title must be at least 5 characters')
		.max(100, 'Title cannot exceed 100 characters'),

	description: z
		.string()
		.min(20, 'Description must be at least 20 characters')
		.max(1000, 'Description cannot exceed 1000 characters'),

	university: z.enum(UNIVERSITY_IDS, {
		message: 'Please select a university'
	}),

	location: z
		.string()
		.min(2, 'Please select a location')
		.max(50, 'Location cannot exceed 50 characters'),

	propertyType: z.enum(PROPERTY_TYPES, {
		message: 'Please select a property type'
	}),

	addressApprox: z
		.string()
		.min(5, 'Approximate address must be at least 5 characters')
		.max(200, 'Approximate address cannot exceed 200 characters'),

	addressFull: z
		.string()
		.min(10, 'Full address must be at least 10 characters')
		.max(300, 'Full address cannot exceed 300 characters'),

	priceYearly: z
		.number({ message: 'Price must be a valid number' })
		.min(50000, 'Yearly rent must be at least ₦50,000')
		.max(5000000, 'Yearly rent cannot exceed ₦5,000,000'),

	bedrooms: z
		.number({ message: 'Bedrooms must be a valid number' })
		.int('Must be a whole number')
		.min(0, 'Bedrooms cannot be negative')
		.max(5, 'Cannot exceed 5 bedrooms'),

	bathrooms: z
		.number({ message: 'Bathrooms must be a valid number' })
		.int('Must be a whole number')
		.min(1, 'Must have at least 1 bathroom')
		.max(4, 'Cannot exceed 4 bathrooms'),

	walkingMinutes: z
		.number({ message: 'Walking time must be a valid number' })
		.int('Must be a whole number')
		.min(1, 'Walking time must be at least 1 minute')
		.max(120, 'Walking time cannot exceed 120 minutes'),

	amenities: z
		.array(z.enum(AMENITIES_OPTIONS))
		.min(1, 'Select at least 1 amenity')
		.max(13, 'Cannot select more than 13 amenities'),

	availabilityStatus: z.enum(AVAILABILITY_STATUSES, {
		message: 'Please select availability status'
	}),

	availableFrom: z
		.string()
		.optional()
		.refine(
			(val) => !val || new Date(val) > new Date(),
			'Available from date must be in the future'
		),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Upload at least 1 photo')
		.max(10, 'Cannot upload more than 10 photos'),

	videos: z
		.array(z.string().url('Each video must be a valid URL'))
		.max(3, 'Cannot upload more than 3 videos')
		.default([]),

	coverPhoto: z.string().url('Cover photo is required'),

	mapPreview: z
		.string()
		.url('Map preview URL must be valid')
		.or(z.string().min(1, 'Map preview URL is required')),

	mapFull: z
		.string()
		.url('Full map URL must be valid')
		.or(z.string().min(1, 'Full map URL is required')),

	// Landlord/Caretaker contact (required for ISA)
	landlordName: z
		.string()
		.max(100, 'Landlord name cannot exceed 100 characters')
		.optional(),

	landlordPhone: z
		.string()
		.regex(/^\+234\d{10}$/, 'Please enter a valid Nigerian phone number (+234XXXXXXXXXX)')
		.optional()
}).refine(
	(data) => {
		const locations = getLocationsForUniversity(data.university);
		return locations.includes(data.location);
	},
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

export type ListingFormData = z.infer<typeof listingFormSchema>;

// Re-export for convenience
export { UNIVERSITY_IDS, getLocationsForUniversity } from '@/lib/config/universities';
