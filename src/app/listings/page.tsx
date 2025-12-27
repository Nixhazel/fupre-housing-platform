'use client';

import { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
	Search,
	Filter,
	Grid3X3,
	List,
	MapPin,
	Star,
	Eye,
	Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/shared/Badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { useListings, useSaveListing, useUnsaveListing } from '@/hooks/api/useListings';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatNaira } from '@/lib/utils/currency';
import { ListingCardSkeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListingFilters } from '@/components/listing/ListingFilters';
import { ListingFilters as ListingFiltersType } from '@/types';
import { toast } from 'sonner';

const defaultFilters: ListingFiltersType = {
	priceRange: [0, 100000],
	bedrooms: [],
	bathrooms: [],
	campusAreas: [],
	amenities: [],
	sortBy: 'newest'
};

function ListingsContent() {
	const searchParams = useSearchParams();
	const { user, isAuthenticated } = useAuth();

	const [filters, setFilters] = useState<ListingFiltersType>(defaultFilters);
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const showSavedOnly = searchParams.get('saved') === 'true';

	// Fetch listings from API
	const {
		data: listingsData,
		isLoading,
		isError,
		error
	} = useListings({
		search: searchQuery || undefined,
		campusArea: filters.campusAreas.length === 1 ? filters.campusAreas[0] as 'Ugbomro' | 'Effurun' | 'Enerhen' | 'PTI Road' | 'Other' : undefined,
		minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
		maxPrice: filters.priceRange[1] < 100000 ? filters.priceRange[1] : undefined,
		bedrooms: filters.bedrooms.length === 1 ? filters.bedrooms[0] : undefined,
		bathrooms: filters.bathrooms.length === 1 ? filters.bathrooms[0] : undefined,
		sortBy: filters.sortBy === 'price_asc' ? 'price_low' : filters.sortBy === 'price_desc' ? 'price_high' : filters.sortBy
	});

	const saveMutation = useSaveListing();
	const unsaveMutation = useUnsaveListing();

	// Client-side filtering for saved listings (since it needs user context)
	const filteredListings = useMemo(() => {
		const listings = listingsData?.listings || [];

		if (showSavedOnly && user) {
			return listings.filter(listing => user.savedListingIds.includes(listing.id));
		}

		return listings;
	}, [listingsData?.listings, showSavedOnly, user]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search is handled by the query hook via searchQuery state
	};

	const toggleFavorite = (listingId: string) => {
		if (!isAuthenticated || !user) {
			toast.error('Please login to save favorites');
			return;
		}

		const isSaved = user.savedListingIds.includes(listingId);

		if (isSaved) {
			unsaveMutation.mutate(listingId, {
				onSuccess: () => toast.success('Removed from favorites'),
				onError: (err) => toast.error(err.message || 'Failed to remove from favorites')
			});
		} else {
			saveMutation.mutate(listingId, {
				onSuccess: () => toast.success('Added to favorites'),
				onError: (err) => toast.error(err.message || 'Failed to add to favorites')
			});
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{[...Array(6)].map((_, i) => (
						<ListingCardSkeleton key={i} />
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<EmptyState
					icon={Search}
					title='Failed to load listings'
					description={error?.message || 'An error occurred while loading listings.'}
					action={{
						label: 'Try Again',
						onClick: () => window.location.reload()
					}}
				/>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold mb-4'>
					{showSavedOnly ? 'Saved Listings' : 'Browse Listings'}
				</h1>
				<p className='text-muted-foreground'>
				{showSavedOnly
					? 'Your saved student accommodations'
					: 'Find your perfect student accommodation near campus'}
				</p>
			</div>

			{/* Search and Filters */}
			<div className='mb-8 space-y-4'>
				{/* Search Bar */}
				<form onSubmit={handleSearch} className='flex gap-4'>
					<div className='flex-1 relative'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							type='text'
							placeholder='Search by location, price, or amenities...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10'
						/>
					</div>

					{/* Mobile Filter Button */}
					<Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
						<SheetTrigger asChild>
							<Button variant='outline' className='md:hidden'>
								<Filter className='h-4 w-4 mr-2' />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent side='left' className='w-80'>
							<SheetHeader>
								<SheetTitle>Filter Listings</SheetTitle>
							</SheetHeader>
							<div className='mt-6'>
								<ListingFilters
									filters={filters}
									onFiltersChange={setFilters}
									onClose={() => setIsFilterOpen(false)}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</form>

				{/* Desktop Filters and View Toggle */}
				<div className='flex flex-col md:flex-row gap-4 md:items-center md:justify-between'>
					{/* Desktop Filters */}
					<div className='hidden md:block'>
						<ListingFilters filters={filters} onFiltersChange={setFilters} />
					</div>

					{/* View Mode Toggle */}
					<div className='flex items-center gap-2'>
						<Button
							variant={viewMode === 'grid' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setViewMode('grid')}>
							<Grid3X3 className='h-4 w-4' />
						</Button>
						<Button
							variant={viewMode === 'list' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setViewMode('list')}>
							<List className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>

			{/* Results */}
			<div className='mb-4 flex items-center justify-between'>
				<p className='text-muted-foreground'>
					{filteredListings.length} listing
					{filteredListings.length !== 1 ? 's' : ''} found
				</p>
			</div>

			{/* Listings Grid/List */}
			{filteredListings.length === 0 ? (
				<EmptyState
					icon={showSavedOnly ? Heart : Search}
					title={showSavedOnly ? 'No saved listings' : 'No listings found'}
					description={
						showSavedOnly
							? "You haven't saved any listings yet. Browse listings and click the heart icon to save them."
							: 'Try adjusting your search criteria or filters to find more results.'
					}
					action={
						showSavedOnly
							? {
									label: 'Browse Listings',
									onClick: () => (window.location.href = '/listings')
							  }
							: {
									label: 'Clear Filters',
									onClick: () => {
										setSearchQuery('');
										setFilters(defaultFilters);
									}
							  }
					}
				/>
			) : (
				<div
					className={
						viewMode === 'grid'
							? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
							: 'space-y-4'
					}>
					{filteredListings.map((listing, index) => {
						const isSaved = user?.savedListingIds.includes(listing.id) ?? false;

						return (
							<motion.div
								key={listing.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}>
								<Card className='overflow-hidden hover:shadow-lg transition-shadow group'>
									<div
										className={`relative overflow-hidden ${
											viewMode === 'grid' ? 'h-48' : 'h-32'
										}`}>
										<Image
											src={listing.coverPhoto}
											alt={listing.title}
											fill
											sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
											className='object-cover group-hover:scale-105 transition-transform'
										/>

										{/* Status Badge */}
										<Badge
											variant={
												listing.status === 'available' ? 'success' : 'secondary'
											}
											className='absolute top-2 right-2'>
											{listing.status}
										</Badge>

										{/* Favorite Button */}
										<Button
											variant='ghost'
											size='sm'
											className='absolute top-2 left-2 bg-white/80 hover:bg-white'
											onClick={(e) => {
												e.preventDefault();
												toggleFavorite(listing.id);
											}}
											disabled={saveMutation.isPending || unsaveMutation.isPending}>
											<Heart
												className={`h-4 w-4 ${
													isSaved ? 'fill-red-500 text-red-500' : ''
												}`}
											/>
										</Button>
									</div>

									<CardContent
										className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
										<div className={viewMode === 'list' ? 'flex gap-4' : ''}>
											<div className={viewMode === 'list' ? 'flex-1' : ''}>
												<h3 className='font-semibold mb-2 line-clamp-1'>
													{listing.title}
												</h3>

												<div className='flex items-center space-x-2 text-sm text-muted-foreground mb-2'>
													<MapPin className='h-4 w-4' />
													<span>{listing.campusArea}</span>
												</div>

												<div className='flex items-center space-x-4 text-sm text-muted-foreground mb-3'>
													<span>
														{listing.bedrooms} bed
														{listing.bedrooms !== 1 ? 's' : ''}
													</span>
													<span>
														{listing.bathrooms} bath
														{listing.bathrooms !== 1 ? 's' : ''}
													</span>
													<span>{listing.distanceToCampusKm}km to campus</span>
												</div>

												<div className='flex items-center justify-between mb-3'>
													<span className='text-lg font-bold text-primary'>
														{formatNaira(listing.priceMonthly)}/month
													</span>
													{listing.reviewsCount > 0 ? (
														<div className='flex items-center space-x-1'>
															<Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
															<span className='text-sm'>{listing.rating.toFixed(1)}</span>
															<span className='text-xs text-muted-foreground'>
																({listing.reviewsCount})
															</span>
														</div>
													) : (
														<span className='text-xs text-muted-foreground'>No reviews</span>
													)}
												</div>

												{/* Amenities */}
												<div className='flex flex-wrap gap-1 mb-3'>
													{listing.amenities.slice(0, 3).map((amenity) => (
														<Badge
															key={amenity}
															variant='outline'
															className='text-xs'>
															{amenity}
														</Badge>
													))}
													{listing.amenities.length > 3 && (
														<Badge variant='outline' className='text-xs'>
															+{listing.amenities.length - 3} more
														</Badge>
													)}
												</div>
											</div>

											<div
												className={
													viewMode === 'list'
														? 'flex flex-col justify-between'
														: ''
												}>
												<div className='flex items-center space-x-2 text-sm text-muted-foreground mb-3'>
													<Eye className='h-4 w-4' />
													<span>{listing.views} views</span>
												</div>

												<Button className='w-full' size='sm' asChild>
													<a href={`/listings/${listing.id}`}>View Details</a>
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function ListingsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ListingsContent />
		</Suspense>
	);
}
