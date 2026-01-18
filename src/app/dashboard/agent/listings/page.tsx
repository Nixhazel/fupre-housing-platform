'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
	Building2,
	Plus,
	Eye,
	Edit,
	Trash2,
	MoreHorizontal,
	Search,
	Calendar,
	MapPin,
	Users,
	Loader2,
	AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Skeleton } from '@/components/shared/Skeleton';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import {
	useAgentListings,
	useMarkListingAsTaken,
	useMarkListingAsAvailable,
	useDeleteListing
} from '@/hooks/api/useAgent';
import { formatNaira } from '@/lib/utils/currency';
import { dayjs } from '@/lib/utils/date';
import { canAccessAgent } from '@/lib/utils/guards';
import { toast } from 'sonner';

export default function AgentListingsPage() {
	const { user, isLoading: authLoading } = useAuth();

	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'available' | 'taken'
	>('all');

	// TanStack Query hooks
	const { data: listingsData, isLoading: listingsLoading } = useAgentListings(
		{ status: statusFilter === 'all' ? undefined : statusFilter },
		{ enabled: !!user && canAccessAgent(user?.role || '') }
	);

	const markAsTakenMutation = useMarkListingAsTaken();
	const markAsAvailableMutation = useMarkListingAsAvailable();
	const deleteMutation = useDeleteListing();

	// Client-side search filtering
	const filteredListings = useMemo(() => {
		const listings = listingsData?.listings ?? [];
		if (!searchQuery) return listings;
		return listings.filter(
			(listing) =>
				listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.location.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [listingsData?.listings, searchQuery]);

	const handleStatusToggle = (listingId: string, currentStatus: string) => {
		if (currentStatus === 'available') {
			markAsTakenMutation.mutate(listingId, {
				onSuccess: () => toast.success('Listing marked as taken'),
				onError: (err) =>
					toast.error(err.message || 'Failed to update listing status')
			});
		} else {
			markAsAvailableMutation.mutate(listingId, {
				onSuccess: () => toast.success('Listing marked as available'),
				onError: (err) =>
					toast.error(err.message || 'Failed to update listing status')
			});
		}
	};

	const handleDeleteListing = (listingId: string) => {
		if (confirm('Are you sure you want to delete this listing?')) {
			deleteMutation.mutate(listingId, {
				onSuccess: () => toast.success('Listing deleted successfully'),
				onError: (err) => toast.error(err.message || 'Failed to delete listing')
			});
		}
	};

	// Loading state
	if (authLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	// Access control
	if (!user || !canAccessAgent(user.role)) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
						<p className='text-muted-foreground mb-6'>
							You don&apos;t have permission to access this page.
						</p>
						<Button asChild>
							<Link href='/'>Go Home</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isLoading = listingsLoading;
	const isMutating =
		markAsTakenMutation.isPending ||
		markAsAvailableMutation.isPending ||
		deleteMutation.isPending;

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>My Listings</h1>
						<p className='text-muted-foreground'>
							Manage your property listings and track their performance
						</p>
					</div>
					<Button asChild>
						<Link href='/dashboard/agent/listings/new'>
							<Plus className='h-4 w-4 mr-2' />
							New Listing
						</Link>
					</Button>
				</div>
			</div>

			{/* Filters */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='mb-6'>
				<Card>
					<CardContent className='pt-6'>
						<div className='flex flex-col md:flex-row gap-4'>
							<div className='flex-1 relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Search listings...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-10'
								/>
							</div>
							<div className='flex gap-2'>
								<Button
									variant={statusFilter === 'all' ? 'default' : 'outline'}
									onClick={() => setStatusFilter('all')}
									size='sm'>
									All
								</Button>
								<Button
									variant={statusFilter === 'available' ? 'default' : 'outline'}
									onClick={() => setStatusFilter('available')}
									size='sm'>
									Available
								</Button>
								<Button
									variant={statusFilter === 'taken' ? 'default' : 'outline'}
									onClick={() => setStatusFilter('taken')}
									size='sm'>
									Taken
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Listings Grid */}
			{isLoading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{[...Array(6)].map((_, i) => (
						<Card key={i} className='overflow-hidden'>
							<Skeleton className='h-48 w-full' />
							<CardContent className='p-4'>
								<Skeleton className='h-5 w-3/4 mb-3' />
								<Skeleton className='h-4 w-1/2 mb-2' />
								<Skeleton className='h-4 w-2/3 mb-2' />
								<Skeleton className='h-4 w-1/3 mb-3' />
								<Skeleton className='h-6 w-1/2' />
							</CardContent>
						</Card>
					))}
				</div>
			) : filteredListings.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}>
					<Card>
						<CardContent className='text-center py-12'>
							<Building2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
							<h3 className='text-lg font-semibold mb-2'>No listings found</h3>
							<p className='text-muted-foreground mb-4'>
								{searchQuery || statusFilter !== 'all'
									? 'Try adjusting your search or filters'
									: 'Create your first listing to get started'}
							</p>
							<Button asChild>
								<Link href='/dashboard/agent/listings/new'>
									<Plus className='h-4 w-4 mr-2' />
									Create New Listing
								</Link>
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredListings.map((listing, index) => (
						<motion.div
							key={listing.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}>
							<Card className='overflow-hidden hover:shadow-lg transition-shadow'>
								<div className='relative h-48'>
									<Image
										src={listing.coverPhoto}
										alt={listing.title}
										fill
										sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
										className='object-cover'
									/>
									<div className='absolute top-2 right-2 flex gap-2'>
										<Badge
											variant={
												listing.status === 'available' ? 'default' : 'secondary'
											}>
											{listing.status}
										</Badge>
									</div>
								</div>

								<CardContent className='p-4'>
									<div className='flex items-start justify-between mb-3'>
										<h3 className='font-semibold line-clamp-1 flex-1'>
											{listing.title}
										</h3>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='ghost' size='sm'>
													<MoreHorizontal className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem asChild>
													<Link href={`/listings/${listing.id}`}>
														<Eye className='h-4 w-4 mr-2' />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href={`/dashboard/agent/listings/${listing.id}/edit`}>
														<Edit className='h-4 w-4 mr-2' />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleStatusToggle(listing.id, listing.status)
													}
													disabled={isMutating}>
													{listing.status === 'available'
														? 'Mark as Taken'
														: 'Mark as Available'}
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleDeleteListing(listing.id)}
													disabled={isMutating}
													className='text-red-600'>
													<Trash2 className='h-4 w-4 mr-2' />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									<div className='space-y-2 mb-3'>
										<div className='flex items-center gap-2 text-sm text-muted-foreground'>
											<MapPin className='h-4 w-4' />
											<span>{listing.location}</span>
										</div>
										<div className='flex items-center gap-2 text-sm text-muted-foreground'>
											<Users className='h-4 w-4' />
											<span>
												{listing.bedrooms} bed, {listing.bathrooms} bath
											</span>
										</div>
										<div className='flex items-center gap-2 text-sm text-muted-foreground'>
											<Calendar className='h-4 w-4' />
											<span>
												Posted {dayjs(listing.createdAt).format('MMM D, YYYY')}
											</span>
										</div>
									</div>

									<div className='flex items-center justify-between'>
										<span className='text-lg font-bold text-primary'>
											{formatNaira(listing.priceYearly)}/yr
										</span>
										<div className='flex items-center gap-1 text-sm text-muted-foreground'>
											<Eye className='h-4 w-4' />
											<span>{listing.views}</span>
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
