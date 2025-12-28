'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
	MapPin,
	Eye,
	Share2,
	Heart,
	Bed,
	Bath,
	Wifi,
	Car,
	Shield,
	Home,
	Users,
	ArrowLeft,
	Lock,
	Unlock,
	Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/shared/Rating';
import { MapBlur } from '@/components/listing/MapBlur';
import {
	useListing,
	useSaveListing,
	useUnsaveListing
} from '@/hooks/api/useListings';
import { useListingReviews } from '@/hooks/api/useReviews';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatNaira } from '@/lib/utils/currency';
import { formatUnlockFee } from '@/lib/config/env';
import { ReviewForm, ReviewList } from '@/components/reviews';
import { toast } from 'sonner';

interface ListingDetailClientProps {
	listingId: string;
}

export function ListingDetailClient({ listingId }: ListingDetailClientProps) {
	const router = useRouter();

	const { user, isAuthenticated } = useAuth();
	const { data, isLoading, isError } = useListing(listingId);
	const { data: reviewsData, isLoading: reviewsLoading } =
		useListingReviews(listingId);
	const saveMutation = useSaveListing();
	const unsaveMutation = useUnsaveListing();

	const listing = data?.listing;
	const isUnlocked = data?.isUnlocked ?? false;
	const isSaved = user?.savedListingIds.includes(listingId) ?? false;

	const handleUnlockLocation = () => {
		if (!isAuthenticated) {
			toast.error('Please login to unlock location');
			router.push('/auth/login');
			return;
		}
		if (listing) {
			router.push(`/unlock/${listing.id}`);
		}
	};

	const handleShare = async () => {
		if (!listing) return;

		if (navigator.share) {
			try {
				await navigator.share({
					title: listing.title,
					text: `Check out this listing: ${listing.title}`,
					url: window.location.href
				});
			} catch {
				// Fallback to clipboard
				navigator.clipboard.writeText(window.location.href);
				toast.success('Link copied to clipboard');
			}
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('Link copied to clipboard');
		}
	};

	const handleToggleFavorite = () => {
		if (!isAuthenticated) {
			toast.error('Please login to save favorites');
			router.push('/auth/login');
			return;
		}

		if (isSaved) {
			unsaveMutation.mutate(listingId, {
				onSuccess: () => toast.success('Removed from favorites'),
				onError: (err) => toast.error(err.message || 'Failed to remove')
			});
		} else {
			saveMutation.mutate(listingId, {
				onSuccess: () => toast.success('Added to favorites'),
				onError: (err) => toast.error(err.message || 'Failed to save')
			});
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<div className='animate-pulse space-y-8'>
					<div className='h-8 bg-muted rounded w-1/3'></div>
					<div className='h-64 bg-muted rounded'></div>
					<div className='grid md:grid-cols-3 gap-8'>
						<div className='md:col-span-2 space-y-4'>
							<div className='h-6 bg-muted rounded w-1/2'></div>
							<div className='h-4 bg-muted rounded w-full'></div>
							<div className='h-4 bg-muted rounded w-3/4'></div>
						</div>
						<div className='space-y-4'>
							<div className='h-32 bg-muted rounded'></div>
							<div className='h-24 bg-muted rounded'></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isError || !listing) {
		return (
			<div className='container mx-auto px-4 py-8 text-center'>
				<h1 className='text-2xl font-bold mb-4'>Listing Not Found</h1>
				<p className='text-muted-foreground mb-6'>
					The listing you&apos;re looking for doesn&apos;t exist or has been
					removed.
				</p>
				<Button onClick={() => router.push('/listings')}>
					Browse All Listings
				</Button>
			</div>
		);
	}

	const amenityIcons: {
		[key: string]: React.ComponentType<{ className?: string }>;
	} = {
		'Wi-Fi': Wifi,
		Water: Home,
		'24/7 Power': Home,
		Security: Shield,
		Furnished: Home,
		'Proximity to shuttle': Car,
		Kitchenette: Home,
		AC: Home,
		Wardrobe: Home,
		Garden: Home
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Back Button */}
			<Button variant='ghost' onClick={() => router.back()} className='mb-6'>
				<ArrowLeft className='h-4 w-4 mr-2' />
				Back
			</Button>

			{/* Header */}
			<div className='mb-8'>
				{/* Title and action buttons */}
				<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4'>
					<div className='flex-1 min-w-0'>
						<h1 className='text-2xl sm:text-3xl font-bold mb-2 wrap-break-word'>
							{listing.title}
						</h1>
						<div className='flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground'>
							<div className='flex items-center gap-1'>
								<MapPin className='h-4 w-4 shrink-0' />
								<span className='truncate max-w-[200px] sm:max-w-none'>
									{isUnlocked ? listing.addressFull : listing.addressApprox}
								</span>
							</div>
							<div className='flex items-center gap-1'>
								<Eye className='h-4 w-4 shrink-0' />
								<span>{listing.views} views</span>
							</div>
						</div>
					</div>

					<div className='flex items-center gap-2 shrink-0'>
						<Button variant='outline' size='sm' onClick={handleShare}>
							<Share2 className='h-4 w-4 sm:mr-2' />
							<span className='hidden sm:inline'>Share</span>
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={handleToggleFavorite}
							disabled={saveMutation.isPending || unsaveMutation.isPending}>
							{saveMutation.isPending || unsaveMutation.isPending ? (
								<Loader2 className='h-4 w-4 sm:mr-2 animate-spin' />
							) : (
								<Heart
									className={`h-4 w-4 sm:mr-2 ${
										isSaved ? 'fill-red-500 text-red-500' : ''
									}`}
								/>
							)}
							<span className='hidden sm:inline'>
								{isSaved ? 'Saved' : 'Save'}
							</span>
						</Button>
					</div>
				</div>

				{/* Price, status, and rating */}
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
					<div className='flex flex-wrap items-center gap-2 sm:gap-4'>
						<span className='text-2xl sm:text-3xl font-bold text-primary'>
							{formatNaira(listing.priceMonthly)}/mo
						</span>
						<Badge
							variant={
								listing.status === 'available' ? 'success' : 'secondary'
							}>
							{listing.status}
						</Badge>
					</div>

					<div className='flex items-center'>
						<Rating
							rating={listing.rating}
							reviewsCount={listing.reviewsCount}
						/>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='grid lg:grid-cols-3 gap-8'>
				{/* Left Column - Images and Details */}
				<div className='lg:col-span-2 space-y-8'>
					{/* Image Gallery */}
					<Card>
						<CardContent className='p-0'>
							<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
								{listing.photos.map((photo: string, index: number) => (
									<div
										key={index}
										className='aspect-square overflow-hidden relative'>
										<Image
											src={photo}
											alt={`${listing.title} - Image ${index + 1}`}
											fill
											sizes='(max-width: 768px) 50vw, 33vw'
											className='object-cover hover:scale-105 transition-transform cursor-pointer'
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Property Details */}
					<Card>
						<CardHeader>
							<CardTitle>Property Details</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								<div className='text-center p-4 bg-muted rounded-lg'>
									<Bed className='h-6 w-6 mx-auto mb-2 text-primary' />
									<div className='font-semibold'>{listing.bedrooms}</div>
									<div className='text-sm text-muted-foreground'>Bedrooms</div>
								</div>
								<div className='text-center p-4 bg-muted rounded-lg'>
									<Bath className='h-6 w-6 mx-auto mb-2 text-primary' />
									<div className='font-semibold'>{listing.bathrooms}</div>
									<div className='text-sm text-muted-foreground'>Bathrooms</div>
								</div>
								<div className='text-center p-4 bg-muted rounded-lg'>
									<MapPin className='h-6 w-6 mx-auto mb-2 text-primary' />
									<div className='font-semibold'>
										{listing.distanceToCampusKm}km
									</div>
									<div className='text-sm text-muted-foreground'>To Campus</div>
								</div>
								<div className='text-center p-4 bg-muted rounded-lg'>
									<Home className='h-6 w-6 mx-auto mb-2 text-primary' />
									<div className='font-semibold'>{listing.campusArea}</div>
									<div className='text-sm text-muted-foreground'>Area</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Description */}
					<Card>
						<CardHeader>
							<CardTitle>Description</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-muted-foreground leading-relaxed'>
								{listing.description}
							</p>
						</CardContent>
					</Card>

					{/* Amenities */}
					<Card>
						<CardHeader>
							<CardTitle>Amenities</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
								{listing.amenities.map((amenity: string) => {
									const Icon = amenityIcons[amenity] || Home;
									return (
										<div key={amenity} className='flex items-center space-x-2'>
											<Icon className='h-4 w-4 text-primary' />
											<span className='text-sm'>{amenity}</span>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Location Map */}
					<Card>
						<CardHeader>
							<CardTitle>Location</CardTitle>
						</CardHeader>
						<CardContent>
							<MapBlur
								mapPreview={listing.mapPreview}
								mapFull={listing.mapFull}
								isUnlocked={isUnlocked}
								onUnlock={handleUnlockLocation}
							/>
						</CardContent>
					</Card>

					{/* Reviews Section */}
					{isAuthenticated && (
						<ReviewForm
							listingId={listingId}
							existingReview={reviewsData?.userReview}
							canReview={reviewsData?.canReview ?? false}
							hasReviewed={reviewsData?.hasReviewed ?? false}
						/>
					)}

					<ReviewList
						reviews={reviewsData?.reviews ?? []}
						isLoading={reviewsLoading}
						averageRating={reviewsData?.averageRating ?? 0}
						totalReviews={reviewsData?.totalReviews ?? 0}
					/>
				</div>

				{/* Right Column - Agent and Contact */}
				<div className='space-y-6'>
					{/* Agent Card */}
					<Card>
						<CardHeader>
							<CardTitle>Property Agent</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center space-x-3'>
								<Avatar className='h-12 w-12'>
									<AvatarImage src={listing.agent?.avatarUrl} />
									<AvatarFallback>
										{listing.agent?.name?.charAt(0).toUpperCase() || 'A'}
									</AvatarFallback>
								</Avatar>
								<div>
									<div className='font-semibold'>
										{listing.agent?.name || 'Agent'}
									</div>
									<div className='text-sm text-muted-foreground'>
										Student Agent (ISA)
									</div>
									{listing.agent?.isVerified && (
										<Badge variant='success' className='text-xs'>
											Verified
										</Badge>
									)}
								</div>
							</div>

							<Separator />

							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Rating</span>
									{listing.rating > 0 ? (
										<Rating
											rating={listing.rating}
											size='sm'
											showCount={false}
										/>
									) : (
										<span className='text-muted-foreground'>
											No ratings yet
										</span>
									)}
								</div>
								<div className='flex justify-between text-sm'>
									<span>Listings</span>
									<span>{listing.agent?.listingsCount ?? 0} active</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<Card>
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
						</CardHeader>
						<CardContent>
							{isUnlocked && listing.agent ? (
								<div className='space-y-3'>
									{listing.agent.phone && (
										<div>
											<div className='text-sm font-medium'>Phone</div>
											<div className='text-sm text-muted-foreground'>
												{listing.agent.phone}
											</div>
										</div>
									)}
									{listing.agent.email && (
										<div>
											<div className='text-sm font-medium'>Email</div>
											<div className='text-sm text-muted-foreground'>
												{listing.agent.email}
											</div>
										</div>
									)}
									<Button
										className='w-full'
										size='lg'
										onClick={() => {
											if (listing.agent?.phone) {
												window.open(`tel:${listing.agent.phone}`, '_self');
											}
										}}>
										<Users className='h-4 w-4 mr-2' />
										Contact Agent
									</Button>
								</div>
							) : (
								<div className='text-center space-y-4'>
									<div className='p-4 bg-muted rounded-lg'>
										<Lock className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
										<p className='text-sm text-muted-foreground'>
											Contact information is locked. Upload payment proof to
											unlock.
										</p>
									</div>
									<Button
										className='w-full'
										size='lg'
										onClick={handleUnlockLocation}>
										<Unlock className='h-4 w-4 mr-2' />
										Unlock Location ({formatUnlockFee()})
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							<Button
								variant='outline'
								className='w-full'
								onClick={handleShare}>
								<Share2 className='h-4 w-4 mr-2' />
								Share Listing
							</Button>
							<Button
								variant='outline'
								className='w-full'
								onClick={handleToggleFavorite}
								disabled={saveMutation.isPending || unsaveMutation.isPending}>
								<Heart
									className={`h-4 w-4 mr-2 ${
										isSaved ? 'fill-red-500 text-red-500' : ''
									}`}
								/>
								{isSaved ? 'Saved' : 'Save to Favorites'}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
