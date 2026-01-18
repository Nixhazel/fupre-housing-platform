'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	Users,
	Heart,
	Calendar,
	Loader2,
	AlertCircle,
	Trash2,
	Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Skeleton } from '@/components/shared/Skeleton';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSavedRoommates, useUnsaveRoommate } from '@/hooks/api/useRoommates';
import { formatNaira } from '@/lib/utils/currency';
import { toast } from 'sonner';

export default function SavedRoommatesPage() {
	const { user, isLoading: authLoading, isAuthenticated } = useAuth();
	const [searchQuery, setSearchQuery] = useState('');

	// Fetch saved roommates
	const { data, isLoading, isError } = useSavedRoommates({
		enabled: isAuthenticated
	});
	const unsaveMutation = useUnsaveRoommate();

	const listings = data?.listings ?? [];

	// Client-side search filter
	const filteredListings = searchQuery
		? listings.filter(
				(l) =>
					l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					l.description.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: listings;

	const handleUnsave = (id: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		unsaveMutation.mutate(id, {
			onSuccess: () => toast.success('Removed from saved'),
			onError: (err) => toast.error(err.message || 'Failed to remove')
		});
	};

	// Loading state
	if (authLoading) {
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
						<AlertCircle className='h-16 w-16 text-yellow-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Login Required</h2>
						<p className='text-muted-foreground mb-6'>
							Please login to view your saved roommate listings.
						</p>
						<Button asChild>
							<Link href='/auth/login?returnUrl=/dashboard/student/saved-roommates'>
								Login
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Saved Roommates</h1>
				<p className='text-muted-foreground'>
					Roommate listings you&apos;ve saved for later
				</p>
			</motion.div>

			{/* Search */}
			{listings.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='mb-6'>
					<div className='relative max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search saved roommates...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10'
						/>
					</div>
				</motion.div>
			)}

			{/* Content */}
			{isLoading ? (
				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{[...Array(6)].map((_, i) => (
						<Card key={i} className='overflow-hidden'>
							<Skeleton className='h-48 w-full' />
							<CardContent className='p-4 space-y-3'>
								<Skeleton className='h-6 w-3/4' />
								<Skeleton className='h-4 w-1/2' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-10 w-full' />
							</CardContent>
						</Card>
					))}
				</div>
			) : isError ? (
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Failed to Load</h2>
						<p className='text-muted-foreground mb-6'>
							An error occurred while loading your saved roommates.
						</p>
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					</CardContent>
				</Card>
			) : filteredListings.length === 0 ? (
				<Card className='text-center'>
					<CardContent className='py-12'>
						<Heart className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>
							{searchQuery ? 'No Results Found' : 'No Saved Roommates'}
						</h2>
						<p className='text-muted-foreground mb-6'>
							{searchQuery
								? 'Try a different search term'
								: "You haven't saved any roommate listings yet. Browse roommates and click the heart icon to save them."}
						</p>
						<Button asChild>
							<Link href='/roommates'>Browse Roommates</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredListings.map((listing, index) => (
						<motion.div
							key={listing.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}>
							<Link href={`/roommates/${listing.id}`}>
								<Card className='overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer h-full'>
									<div className='relative h-48'>
										{listing.photos && listing.photos.length > 0 ? (
											<Image
												src={listing.photos[0]}
												alt={listing.title}
												fill
												sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
												className='object-cover group-hover:scale-105 transition-transform'
											/>
										) : (
											<div className='w-full h-full bg-muted flex items-center justify-center'>
												<Users className='h-12 w-12 text-muted-foreground' />
											</div>
										)}
										<Button
											variant='ghost'
											size='sm'
											className='absolute top-2 right-2 bg-white/80 hover:bg-white'
											disabled={unsaveMutation.isPending}
											onClick={(e) => handleUnsave(listing.id, e)}>
											{unsaveMutation.isPending ? (
												<Loader2 className='h-4 w-4 animate-spin' />
											) : (
												<Trash2 className='h-4 w-4 text-red-500' />
											)}
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
											<Badge variant='outline'>
												{listing.ownerType === 'student' ? 'Student' : 'Owner'}
											</Badge>
										</div>

										<div className='space-y-2'>
											{listing.preferences?.gender && (
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
													{new Date(listing.moveInDate).toLocaleDateString()}
												</span>
											</div>
										</div>

										<p className='text-sm text-muted-foreground line-clamp-2'>
											{listing.description}
										</p>

										<Button className='w-full' size='sm'>
											View Details
										</Button>
									</CardContent>
								</Card>
							</Link>
						</motion.div>
					))}
				</div>
			)}

			{/* Stats */}
			{!isLoading && listings.length > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className='mt-8 text-center text-sm text-muted-foreground'>
					{filteredListings.length === listings.length
						? `${listings.length} saved roommate${listings.length !== 1 ? 's' : ''}`
						: `Showing ${filteredListings.length} of ${listings.length} saved`}
				</motion.div>
			)}
		</div>
	);
}

