'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useListingsStore } from '@/lib/store/listingsSlice';
import { useAuthStore } from '@/lib/store/authSlice';
import { formatNaira } from '@/lib/utils/currency';
import { ListingCardSkeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListingFilters } from '@/components/listing/ListingFilters';

function ListingsContent() {
	const searchParams = useSearchParams();
	const { user } = useAuthStore();
	const {
		filters,
		searchQuery,
		viewMode,
		setFilters,
		setSearchQuery,
		setViewMode,
		getFilteredListings
	} = useListingsStore();

	const [isLoading, setIsLoading] = useState(true);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	// Initialize search from URL params
	useEffect(() => {
		const search = searchParams.get('search');
		if (search) {
			setSearchQuery(search);
		}
		setIsLoading(false);
	}, [searchParams, setSearchQuery]);

	const allListings = getFilteredListings();
	const showSavedOnly = searchParams.get('saved') === 'true';
	
	const filteredListings = showSavedOnly && user 
		? allListings.filter(listing => user.savedListingIds.includes(listing.id))
		: allListings;

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search is handled by the store
	};

	const toggleFavorite = (listingId: string) => {
		// TODO: Implement favorite functionality
		console.log('Toggle favorite:', listingId);
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

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold mb-4'>
					{showSavedOnly ? 'Saved Listings' : 'Browse Listings'}
				</h1>
				<p className='text-muted-foreground'>
					{showSavedOnly 
						? 'Your saved student accommodations near FUPRE campus'
						: 'Find your perfect student accommodation near FUPRE campus'
					}
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
					description={showSavedOnly 
						? 'You haven\'t saved any listings yet. Browse listings and click the heart icon to save them.'
						: 'Try adjusting your search criteria or filters to find more results.'
					}
					action={showSavedOnly ? {
						label: 'Browse Listings',
						onClick: () => window.location.href = '/listings'
					} : {
						label: 'Clear Filters',
						onClick: () => {
							setSearchQuery('');
							setFilters({
								priceRange: [0, 100000],
								bedrooms: [],
								bathrooms: [],
								campusAreas: [],
								amenities: [],
								sortBy: 'newest'
							});
						}
					}}
				/>
			) : (
				<div
					className={
						viewMode === 'grid'
							? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
							: 'space-y-4'
					}>
					{filteredListings.map((listing, index) => (
						<motion.div
							key={listing.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}>
							<Card className='overflow-hidden hover:shadow-lg transition-shadow group'>
								<div className='relative'>
									<img
										src={listing.coverPhoto}
										alt={listing.title}
										className={`w-full object-cover group-hover:scale-105 transition-transform ${
											viewMode === 'grid' ? 'h-48' : 'h-32'
										}`}
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
										onClick={() => toggleFavorite(listing.id)}>
										<Heart className='h-4 w-4' />
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
												<div className='flex items-center space-x-1'>
													<Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
													<span className='text-sm'>{listing.rating}</span>
													<span className='text-xs text-muted-foreground'>
														({listing.reviewsCount})
													</span>
												</div>
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
					))}
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
