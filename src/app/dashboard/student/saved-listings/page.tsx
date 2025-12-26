'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowLeft,
	Heart,
	Search,
	Building2,
	MapPin,
	Bed,
	Bath,
	Loader2,
	AlertCircle,
	X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSavedListings, useUnsaveListing } from '@/hooks/api/useListings';
import { formatNaira } from '@/lib/utils/currency';
import { toast } from 'sonner';

export default function SavedListingsPage() {
	const { user, isLoading: isUserLoading, isAuthenticated } = useAuth();
	const [searchQuery, setSearchQuery] = useState('');

	// Fetch saved listings
	const {
		data: savedListingsData,
		isLoading: isListingsLoading,
		isError
	} = useSavedListings({ enabled: isAuthenticated });

	// Unsave mutation
	const unsaveMutation = useUnsaveListing();

	const listings = useMemo(
		() => savedListingsData?.listings || [],
		[savedListingsData?.listings]
	);

	// Filter listings by search
	const filteredListings = useMemo(() => {
		if (!searchQuery.trim()) return listings;
		const query = searchQuery.toLowerCase();
		return listings.filter(
			(listing) =>
				listing.title.toLowerCase().includes(query) ||
				listing.campusArea.toLowerCase().includes(query) ||
				listing.addressApprox.toLowerCase().includes(query)
		);
	}, [listings, searchQuery]);

	const handleUnsave = (listingId: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		unsaveMutation.mutate(listingId, {
			onSuccess: () => {
				toast.success('Removed from saved listings');
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to remove listing');
			}
		});
	};

	const isLoading = isUserLoading || isListingsLoading;

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	// Not authenticated
	if (!isAuthenticated || !user) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-amber-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Login Required</h2>
						<p className='text-muted-foreground mb-6'>
							Please log in to view your saved listings.
						</p>
						<Button asChild>
							<Link href='/auth/login?returnUrl=/dashboard/student/saved-listings'>
								Log In
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Error Loading Listings</h2>
						<p className='text-muted-foreground mb-6'>
							Something went wrong. Please try again.
						</p>
						<Button onClick={() => window.location.reload()}>Retry</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8'>
				{/* Back Button */}
				<Button variant='ghost' asChild className='mb-6'>
					<Link href='/dashboard/student'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Dashboard
					</Link>
				</Button>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8'>
					<div className='flex items-center gap-4 mb-4'>
						<div className='p-3 rounded-full bg-red-100 dark:bg-red-900/30'>
							<Heart className='h-6 w-6 text-red-500' />
						</div>
						<div>
							<h1 className='text-3xl font-bold'>Saved Listings</h1>
							<p className='text-muted-foreground'>
								{listings.length} saved listing{listings.length !== 1 ? 's' : ''}
							</p>
						</div>
					</div>

					{/* Search */}
					{listings.length > 0 && (
						<div className='relative max-w-md'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search saved listings...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>
					)}
				</motion.div>

				{/* Content */}
				{listings.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}>
						<Card className='text-center'>
							<CardContent className='py-16'>
								<Building2 className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
								<h2 className='text-2xl font-bold mb-2'>No Saved Listings</h2>
								<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
									You haven&apos;t saved any property listings yet. Browse listings 
									and click the heart icon to save them for later.
								</p>
								<Button asChild>
									<Link href='/listings'>Browse Listings</Link>
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				) : filteredListings.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}>
						<Card className='text-center'>
							<CardContent className='py-16'>
								<Search className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
								<h2 className='text-2xl font-bold mb-2'>No Results</h2>
								<p className='text-muted-foreground mb-6'>
									No listings match your search &quot;{searchQuery}&quot;
								</p>
								<Button variant='outline' onClick={() => setSearchQuery('')}>
									Clear Search
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredListings.map((listing, index) => (
							<motion.div
								key={listing.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.05 * index }}>
								<Link href={`/listings/${listing.id}`}>
									<Card className='overflow-hidden hover:shadow-lg transition-all group'>
										{/* Image */}
										<div className='relative aspect-4/3'>
											<Image
												src={listing.coverPhoto}
												alt={listing.title}
												fill
												className='object-cover group-hover:scale-105 transition-transform duration-300'
												sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
											/>
											{/* Status Badge */}
											<div className='absolute top-3 left-3'>
												<Badge
													variant={
														listing.status === 'available'
															? 'success'
															: 'secondary'
													}>
													{listing.status}
												</Badge>
											</div>
											{/* Unsave Button */}
											<Button
												variant='destructive'
												size='icon'
												className='absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
												onClick={(e) => handleUnsave(listing.id, e)}
												disabled={unsaveMutation.isPending}>
												{unsaveMutation.isPending ? (
													<Loader2 className='h-4 w-4 animate-spin' />
												) : (
													<X className='h-4 w-4' />
												)}
											</Button>
											{/* Price Badge */}
											<div className='absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold'>
												{formatNaira(listing.priceMonthly)}/mo
											</div>
										</div>

										{/* Content */}
										<CardContent className='p-4'>
											<h3 className='font-semibold text-lg mb-2 line-clamp-1'>
												{listing.title}
											</h3>
											<div className='flex items-center text-muted-foreground text-sm mb-3'>
												<MapPin className='h-4 w-4 mr-1 shrink-0' />
												<span className='line-clamp-1'>
													{listing.addressApprox}
												</span>
											</div>
											<div className='flex items-center gap-4 text-sm'>
												<div className='flex items-center gap-1'>
													<Bed className='h-4 w-4 text-muted-foreground' />
													<span>{listing.bedrooms} bed</span>
												</div>
												<div className='flex items-center gap-1'>
													<Bath className='h-4 w-4 text-muted-foreground' />
													<span>{listing.bathrooms} bath</span>
												</div>
												<div className='flex items-center gap-1 text-muted-foreground'>
													<MapPin className='h-4 w-4' />
													<span>{listing.distanceToCampusKm}km</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</Link>
							</motion.div>
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}

