import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/connect';
import RoommateListing from '@/lib/db/models/RoommateListing';
import { RoommateDetailClient } from '@/components/roommates/RoommateDetailClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://easyvilleestates.com';

interface PageProps {
	params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params;
	
	try {
		await connectDB();
		const listing = await RoommateListing.findOne({ _id: id, isDeleted: false })
			.select('title description budgetMonthly moveInDate photos')
			.lean();

		if (!listing) {
			return {
				title: 'Roommate Listing Not Found | EasyVille Estates',
				description: 'The roommate listing you are looking for could not be found.'
			};
		}

		// Create SEO-friendly description
		const budgetFormatted = new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 0
		}).format(listing.budgetMonthly);

		const moveInDate = new Date(listing.moveInDate).toLocaleDateString('en-NG', {
			month: 'short',
			year: 'numeric'
		});

		const shortDescription =
			listing.description.length > 100
				? `${listing.description.substring(0, 100)}...`
				: listing.description;

		const fullDescription = `Budget: ${budgetFormatted}/month | Move-in: ${moveInDate}. ${shortDescription}`;

		// Get first photo or null
		const ogImage = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

		return {
			title: `${listing.title} | Find Roommates | EasyVille Estates`,
			description: fullDescription,
			openGraph: {
				title: listing.title,
				description: fullDescription,
				type: 'website',
				locale: 'en_NG',
				url: `${BASE_URL}/roommates/${id}`,
				siteName: 'EasyVille Estates',
				images: ogImage
					? [
							{
								url: ogImage,
								width: 1200,
								height: 630,
								alt: listing.title
							}
					  ]
					: []
			}
		};
	} catch {
		return {
			title: 'Roommate Listing | EasyVille Estates',
			description: 'Find your perfect roommate on EasyVille Estates.'
		};
	}
}

export default async function RoommateDetailPage({ params }: PageProps) {
	const { id } = await params;
	
	// Validate ObjectId format
	if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
		notFound();
	}

	return <RoommateDetailClient listingId={id} />;
}
