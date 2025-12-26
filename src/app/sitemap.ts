import { MetadataRoute } from 'next';
import connectDB from '@/lib/db/connect';
import Listing from '@/lib/db/models/Listing';
import RoommateListing from '@/lib/db/models/RoommateListing';

// Force dynamic rendering - this route requires database access
export const dynamic = 'force-dynamic';

const BASE_URL =
	process.env.NEXT_PUBLIC_APP_URL || 'https://easyvilleestates.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Connect to database
	await connectDB();

	// Fetch all active listings
	const listings = await Listing.find({ isDeleted: false })
		.select('_id updatedAt')
		.lean();

	// Fetch all active roommate listings
	const roommates = await RoommateListing.find({ isDeleted: false })
		.select('_id updatedAt')
		.lean();

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1.0
		},
		{
			url: `${BASE_URL}/listings`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9
		},
		{
			url: `${BASE_URL}/roommates`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9
		},
		{
			url: `${BASE_URL}/help`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.5
		}
	];

	// Dynamic listing pages
	const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
		url: `${BASE_URL}/listings/${listing._id.toString()}`,
		lastModified: listing.updatedAt || new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.8
	}));

	// Dynamic roommate pages
	const roommatePages: MetadataRoute.Sitemap = roommates.map((roommate) => ({
		url: `${BASE_URL}/roommates/${roommate._id.toString()}`,
		lastModified: roommate.updatedAt || new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.7
	}));

	return [...staticPages, ...listingPages, ...roommatePages];
}
