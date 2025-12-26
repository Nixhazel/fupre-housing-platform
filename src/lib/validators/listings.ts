import { z } from 'zod';

/**
 * Client-side Listing Validators
 *
 * Zod schemas for listing form validation
 */

// Campus areas
export const CAMPUS_AREAS = [
	'Ugbomro',
	'Effurun',
	'Enerhen',
	'PTI Road',
	'Other'
] as const;

export type CampusArea = (typeof CAMPUS_AREAS)[number];

// Available amenities
export const AMENITIES_OPTIONS = [
	'Wi-Fi',
	'Water',
	'24/7 Power',
	'Security',
	'Furnished',
	'Proximity to shuttle',
	'Kitchenette',
	'AC',
	'Wardrobe',
	'Garden',
	'Parking',
	'CCTV',
	'Generator Backup',
	'Gated Compound',
	'Tiled Floor'
] as const;

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

	campusArea: z.enum(CAMPUS_AREAS, {
		message: 'Please select a campus area'
	}),

	addressApprox: z
		.string()
		.min(5, 'Approximate address must be at least 5 characters')
		.max(200, 'Approximate address cannot exceed 200 characters'),

	addressFull: z
		.string()
		.min(10, 'Full address must be at least 10 characters')
		.max(300, 'Full address cannot exceed 300 characters'),

	priceMonthly: z
		.number({ message: 'Price must be a valid number' })
		.min(5000, 'Price must be at least ₦5,000')
		.max(500000, 'Price cannot exceed ₦500,000'),

	bedrooms: z
		.number({ message: 'Bedrooms must be a valid number' })
		.int('Must be a whole number')
		.min(1, 'Must have at least 1 bedroom')
		.max(5, 'Cannot exceed 5 bedrooms'),

	bathrooms: z
		.number({ message: 'Bathrooms must be a valid number' })
		.int('Must be a whole number')
		.min(1, 'Must have at least 1 bathroom')
		.max(4, 'Cannot exceed 4 bathrooms'),

	distanceToCampusKm: z
		.number({ message: 'Distance must be a valid number' })
		.min(0.1, 'Distance must be at least 0.1km')
		.max(20, 'Distance cannot exceed 20km'),

	amenities: z
		.array(z.string())
		.min(1, 'Select at least 1 amenity')
		.max(10, 'Cannot select more than 10 amenities'),

	photos: z
		.array(z.string().url('Each photo must be a valid URL'))
		.min(1, 'Upload at least 1 photo')
		.max(10, 'Cannot upload more than 10 photos'),

	coverPhoto: z.string().url('Cover photo is required'),

	mapPreview: z
		.string()
		.url('Map preview URL must be valid')
		.or(z.string().min(1, 'Map preview URL is required')),

	mapFull: z
		.string()
		.url('Full map URL must be valid')
		.or(z.string().min(1, 'Full map URL is required'))
});

export type ListingFormData = z.infer<typeof listingFormSchema>;
