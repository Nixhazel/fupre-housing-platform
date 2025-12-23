'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
	Users,
	Search,
	Filter,
	Plus,
	Calendar,
	Heart,
	MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { useRoommatesStore } from '@/lib/store/roommatesSlice';
import { useAuthStore } from '@/lib/store/authSlice';
import { formatNaira } from '@/lib/utils/currency';
import { EmptyState } from '@/components/shared/EmptyState';
import { RoommateFilters } from '@/components/roommate/RoommateFilters';
import { canCreateRoommateListings } from '@/lib/utils/guards';

function RoommatesContent() {
	const {
		filters,
		searchQuery,
		setFilters,
		setSearchQuery,
		getFilteredRoommateListings
	} = useRoommatesStore();
	const { user } = useAuthStore();

	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const filteredListings = getFilteredRoommateListings();

	const toggleFavorite = (id: string) => {
		// TODO: Implement favorite functionality
		console.log('Toggle favorite:', id);
	};

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8'>
					<h1 className='text-3xl font-bold mb-2'>Find Roommates</h1>
					<p className='text-muted-foreground'>
						Connect with fellow students and find your perfect roommate.
					</p>
				</motion.div>

				{/* Search and Filter */}
				<div className='flex flex-col md:flex-row gap-4 mb-8'>
					<div className='flex-1 relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search roommates...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10'
						/>
					</div>
					<Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
						<SheetTrigger asChild>
							<Button variant='outline'>
								<Filter className='h-4 w-4 mr-2' />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Filter Roommates</SheetTitle>
							</SheetHeader>
							<RoommateFilters
								filters={filters}
								onFiltersChange={setFilters}
								onClose={() => setIsFilterOpen(false)}
							/>
						</SheetContent>
					</Sheet>
					{canCreateRoommateListings(user?.role) && (
						<Button asChild>
							<Link href='/roommates/new'>
								<Plus className='h-4 w-4 mr-2' />
								New Listing
							</Link>
						</Button>
					)}
				</div>

				{/* Tabs */}
				<Tabs defaultValue='find' className='space-y-6'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='find'>Find a Roommate</TabsTrigger>
						<TabsTrigger value='owner'>I&apos;m an Owner</TabsTrigger>
					</TabsList>

					{/* Find a Roommate Tab */}
					<TabsContent value='find' className='space-y-6'>
						{filteredListings.filter((l) => l.ownerType === 'student')
							.length === 0 ? (
							<EmptyState
								icon={Users}
								title='No roommates found'
								description='Try adjusting your search or filters to find more roommates.'
								action={{
									label: 'Clear filters',
									onClick: () => {
										setSearchQuery('');
										setFilters({
											budgetRange: [0, 100000]
										});
									}
								}}
							/>
						) : (
							<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{filteredListings
									.filter((l) => l.ownerType === 'student')
									.map((listing, index) => (
										<motion.div
											key={listing.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}>
											<Link href={`/roommates/${listing.id}`}>
												<Card className='overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer'>
													<div className='relative h-48'>
														{listing.photos.length > 0 && (
															<Image
																src={listing.photos[0]}
																alt={listing.title}
																fill
																sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
																className='object-cover group-hover:scale-105 transition-transform'
															/>
														)}
														<Button
															variant='ghost'
															size='sm'
															className='absolute top-2 right-2 bg-white/80 hover:bg-white'
															onClick={(e) => {
																e.preventDefault();
																toggleFavorite(listing.id);
															}}>
															<Heart className='h-4 w-4' />
														</Button>
													</div>

													<CardContent className='p-4 space-y-3'>
														<h3 className='font-semibold line-clamp-1'>
															{listing.title}
														</h3>

														<div className='flex items-center justify-between'>
															<span className='text-lg font-bold text-primary'>
																{formatNaira(listing.budgetMonthly)}/month
															</span>
															<Badge variant='outline'>Student</Badge>
														</div>

														<div className='space-y-2'>
															{listing.preferences.gender && (
																<div className='flex items-center space-x-2 text-sm'>
																	<Users className='h-4 w-4 text-muted-foreground' />
																	<span>
																		Looking for: {listing.preferences.gender}
																	</span>
																</div>
															)}
															<div className='flex items-center space-x-2 text-sm text-muted-foreground'>
																<Calendar className='h-4 w-4' />
																<span>
																	Move-in:{' '}
																	{new Date(
																		listing.moveInDate
																	).toLocaleDateString()}
																</span>
															</div>
														</div>

														<p className='text-sm text-muted-foreground line-clamp-2'>
															{listing.description}
														</p>

														<div className='flex gap-2'>
															<Button className='flex-1' size='sm'>
																View Details
															</Button>
															<Button variant='outline' size='sm'>
																<MessageCircle className='h-4 w-4' />
															</Button>
														</div>
													</CardContent>
												</Card>
											</Link>
										</motion.div>
									))}
							</div>
						)}
					</TabsContent>

					{/* I'm an Owner Tab */}
					<TabsContent value='owner' className='space-y-6'>
						{filteredListings.filter((l) => l.ownerType === 'owner').length ===
						0 ? (
							<EmptyState
								icon={Users}
								title='No owner listings found'
								description='Try adjusting your search or filters to find more listings.'
								action={{
									label: 'Clear filters',
									onClick: () => {
										setSearchQuery('');
										setFilters({
											budgetRange: [0, 100000]
										});
									}
								}}
							/>
						) : (
							<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{filteredListings
									.filter((l) => l.ownerType === 'owner')
									.map((listing, index) => (
										<motion.div
											key={listing.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}>
											<Link href={`/roommates/${listing.id}`}>
												<Card className='overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer'>
													<div className='relative h-48'>
														{listing.photos.length > 0 && (
															<Image
																src={listing.photos[0]}
																alt={listing.title}
																fill
																sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
																className='object-cover group-hover:scale-105 transition-transform'
															/>
														)}
														<Button
															variant='ghost'
															size='sm'
															className='absolute top-2 right-2 bg-white/80 hover:bg-white'
															onClick={(e) => {
																e.preventDefault();
																toggleFavorite(listing.id);
															}}>
															<Heart className='h-4 w-4' />
														</Button>
													</div>

													<CardContent className='p-4 space-y-3'>
														<h3 className='font-semibold line-clamp-1'>
															{listing.title}
														</h3>

														<div className='flex items-center justify-between'>
															<span className='text-lg font-bold text-primary'>
																{formatNaira(listing.budgetMonthly)}/month
															</span>
															<Badge variant='outline'>Owner</Badge>
														</div>

														<div className='space-y-2'>
															{listing.preferences.gender && (
																<div className='flex items-center space-x-2 text-sm'>
																	<Users className='h-4 w-4 text-muted-foreground' />
																	<span>
																		Looking for: {listing.preferences.gender}
																	</span>
																</div>
															)}
															<div className='flex items-center space-x-2 text-sm text-muted-foreground'>
																<Calendar className='h-4 w-4' />
																<span>
																	Move-in:{' '}
																	{new Date(
																		listing.moveInDate
																	).toLocaleDateString()}
																</span>
															</div>
														</div>

														<p className='text-sm text-muted-foreground line-clamp-2'>
															{listing.description}
														</p>

														<div className='flex gap-2'>
															<Button className='flex-1' size='sm'>
																View Details
															</Button>
															<Button variant='outline' size='sm'>
																<MessageCircle className='h-4 w-4' />
															</Button>
														</div>
													</CardContent>
												</Card>
											</Link>
										</motion.div>
									))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default function RoommatesPage() {
	return <RoommatesContent />;
}
