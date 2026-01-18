'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
	BarChart3,
	Building2,
	Eye,
	TrendingUp,
	Users,
	Plus,
	MoreHorizontal,
	Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAgentStats, useAgentListings } from '@/hooks/api/useAgent';
import { formatNaira } from '@/lib/utils/currency';
import { canAccessAgent } from '@/lib/utils/guards';
import { useRouter } from 'next/navigation';

export default function AgentDashboard() {
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();

	// Fetch agent data
	const { data: statsData, isLoading: statsLoading } = useAgentStats({
		enabled: !!user && canAccessAgent(user.role)
	});
	const { data: listingsData, isLoading: listingsLoading } = useAgentListings(
		{ limit: 5 },
		{ enabled: !!user && canAccessAgent(user.role) }
	);

	// statsData is now AgentStats directly (not { stats: AgentStats })
	const stats = statsData;
	const listings = listingsData?.listings || [];

	useEffect(() => {
		if (!authLoading && (!user || !canAccessAgent(user.role))) {
			router.push('/');
		}
	}, [user, authLoading, router]);

	if (authLoading || !user || !canAccessAgent(user.role)) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	const isLoading = statsLoading || listingsLoading;

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Agent Dashboard</h1>
				<p className='text-muted-foreground'>
					Welcome back, {user.name}! Manage your listings and track your
					performance.
				</p>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Listings
							</CardTitle>
							<Building2 className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='h-8 w-16 bg-muted animate-pulse rounded' />
							) : (
								<>
									<div className='text-2xl font-bold'>
										{stats?.totalListings ?? 0}
									</div>
									<p className='text-xs text-muted-foreground'>
										{stats?.activeListings ?? 0} active
									</p>
								</>
							)}
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Total Views</CardTitle>
							<Eye className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='h-8 w-16 bg-muted animate-pulse rounded' />
							) : (
								<>
									<div className='text-2xl font-bold'>
										{stats?.totalViews ?? 0}
									</div>
									<p className='text-xs text-muted-foreground'>
										+12% from last month
									</p>
								</>
							)}
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Earnings</CardTitle>
							<TrendingUp className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='h-8 w-24 bg-muted animate-pulse rounded' />
							) : (
								<>
									<div className='text-2xl font-bold'>
										{formatNaira(stats?.totalEarnings ?? 0)}
									</div>
									<p className='text-xs text-muted-foreground'>This month</p>
								</>
							)}
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.3 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Unlocks</CardTitle>
							<BarChart3 className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='h-8 w-16 bg-muted animate-pulse rounded' />
							) : (
								<>
									<div className='text-2xl font-bold'>
										{stats?.totalUnlocks ?? 0}
									</div>
									<p className='text-xs text-muted-foreground'>Total unlocks</p>
								</>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Quick Actions */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.4 }}
				className='mb-8'>
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>
							Manage your listings and grow your business
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex flex-wrap gap-4'>
							<Button asChild>
								<a href='/dashboard/agent/listings/new'>
									<Plus className='h-4 w-4 mr-2' />
									Create New Listing
								</a>
							</Button>
							<Button variant='outline' asChild>
								<a href='/dashboard/agent/listings'>
									<Building2 className='h-4 w-4 mr-2' />
									Manage Listings
								</a>
							</Button>
							<Button variant='outline' asChild>
								<a href='/dashboard/agent/earnings'>
									<TrendingUp className='h-4 w-4 mr-2' />
									View Earnings
								</a>
							</Button>
							<Button variant='outline' asChild>
								<a href='/dashboard/agent/profile'>
									<Users className='h-4 w-4 mr-2' />
									Update Profile
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Recent Listings */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.5 }}>
				<Card>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<div>
								<CardTitle>Recent Listings</CardTitle>
								<CardDescription>Your latest property listings</CardDescription>
							</div>
							<Button variant='outline' size='sm' asChild>
								<a href='/dashboard/agent/listings'>View All</a>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{listingsLoading ? (
							<div className='space-y-4'>
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className='flex items-center space-x-4 p-4 border rounded-lg'>
										<div className='w-16 h-16 bg-muted animate-pulse rounded-lg' />
										<div className='flex-1 space-y-2'>
											<div className='h-4 w-1/2 bg-muted animate-pulse rounded' />
											<div className='h-3 w-1/4 bg-muted animate-pulse rounded' />
										</div>
									</div>
								))}
							</div>
						) : listings.length === 0 ? (
							<div className='text-center py-8'>
								<Building2 className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
								<h3 className='text-lg font-semibold mb-2'>No listings yet</h3>
								<p className='text-muted-foreground mb-4'>
									Create your first listing to start earning commissions
								</p>
								<Button asChild>
									<a href='/dashboard/agent/listings/new'>
										<Plus className='h-4 w-4 mr-2' />
										Create First Listing
									</a>
								</Button>
							</div>
						) : (
							<div className='space-y-4'>
								{listings.slice(0, 5).map((listing, index) => (
									<motion.div
										key={listing.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: index * 0.1 }}
										className='flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
										<div className='relative w-16 h-16 shrink-0'>
											<Image
												src={listing.coverPhoto}
												alt={listing.title}
												fill
												sizes='64px'
												className='rounded-lg object-cover'
											/>
										</div>
										<div className='flex-1 min-w-0'>
											<h4 className='font-semibold truncate'>
												{listing.title}
											</h4>
											<p className='text-sm text-muted-foreground'>
												{listing.location}
											</p>
											<div className='flex items-center space-x-4 mt-1'>
												<span className='text-sm font-medium text-primary'>
													{formatNaira(listing.priceYearly)}/yr
												</span>
												<Badge
													variant={
														listing.status === 'available'
															? 'success'
															: 'secondary'
													}>
													{listing.status}
												</Badge>
											</div>
										</div>
										<div className='flex items-center space-x-2'>
											<div className='text-right'>
												<div className='text-sm font-medium'>
													{listing.views}
												</div>
												<div className='text-xs text-muted-foreground'>
													views
												</div>
											</div>
											<Button variant='ghost' size='sm'>
												<MoreHorizontal className='h-4 w-4' />
											</Button>
										</div>
									</motion.div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
