import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/connect';
import Listing from '@/lib/db/models/Listing';
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';

const BASE_URL =
	process.env.NEXT_PUBLIC_APP_URL || 'https://easyvilleestates.com';

interface PageProps {
	params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({
	params
}: PageProps): Promise<Metadata> {
	const { id } = await params;

	try {
		await connectDB();
		const listing = await Listing.findOne({ _id: id, isDeleted: false })
			.select(
				'title description coverPhoto priceYearly university location addressApprox'
			)
			.lean();

		if (!listing) {
			return {
				title: 'Listing Not Found | EasyVille Estates',
				description: 'The listing you are looking for could not be found.'
			};
		}

		// Create SEO-friendly description
		const priceFormatted = new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 0
		}).format(listing.priceYearly);

		const description =
			listing.description.length > 155
				? `${listing.description.substring(0, 155)}...`
				: listing.description;

		const fullDescription = `${priceFormatted}/year in ${listing.location}. ${description}`;

		return {
			title: `${listing.title} | EasyVille Estates`,
			description: fullDescription,
			openGraph: {
				title: listing.title,
				description: fullDescription,
				type: 'website',
				locale: 'en_NG',
				url: `${BASE_URL}/listings/${id}`,
				siteName: 'EasyVille Estates',
				images: listing.coverPhoto
					? [
							{
								url: listing.coverPhoto,
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
			title: 'Listing | EasyVille Estates',
			description: 'View property listing details on EasyVille Estates.'
		};
	}
}

export default async function ListingDetailPage({ params }: PageProps) {
	const { id } = await params;

	// Validate ObjectId format
	if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
		notFound();
	}

	return <ListingDetailClient listingId={id} />;
}
