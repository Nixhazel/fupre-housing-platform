import { z } from 'zod';

export const listingSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.min(5, 'Title must be at least 5 characters')
		.max(100, 'Title must be less than 100 characters'),
	description: z
		.string()
		.min(1, 'Description is required')
		.min(20, 'Description must be at least 20 characters')
		.max(1000, 'Description must be less than 1000 characters'),
	campusArea: z.enum(['Ugbomro', 'Effurun', 'Enerhen', 'PTI Road', 'Other']),
	addressApprox: z
		.string()
		.min(1, 'Approximate address is required')
		.min(5, 'Address must be at least 5 characters')
		.max(200, 'Address must be less than 200 characters'),
	addressFull: z
		.string()
		.min(1, 'Full address is required')
		.min(10, 'Full address must be at least 10 characters')
		.max(300, 'Full address must be less than 300 characters'),
	priceMonthly: z
		.number()
		.min(1, 'Price is required')
		.min(5000, 'Price must be at least ₦5,000')
		.max(500000, 'Price must be less than ₦500,000'),
	bedrooms: z
		.number()
		.min(1, 'Number of bedrooms is required')
		.min(1, 'Must have at least 1 bedroom')
		.max(5, 'Cannot have more than 5 bedrooms'),
	bathrooms: z
		.number()
		.min(1, 'Number of bathrooms is required')
		.min(1, 'Must have at least 1 bathroom')
		.max(4, 'Cannot have more than 4 bathrooms'),
	distanceToCampusKm: z
		.number()
		.min(0.1, 'Distance must be at least 0.1km')
		.max(20, 'Distance cannot be more than 20km'),
	amenities: z
		.array(z.string())
		.min(1, 'Please select at least one amenity')
		.max(10, 'Cannot select more than 10 amenities'),
	photos: z
		.array(z.string())
		.min(1, 'Please upload at least one photo')
		.max(10, 'Cannot upload more than 10 photos'),
	coverPhoto: z.string().min(1, 'Please select a cover photo')
});

export type ListingFormData = z.infer<typeof listingSchema>;
