'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	BarChart3,
	Building2,
	Eye,
	TrendingUp,
	Users,
	Plus,
	MoreHorizontal
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
import { useAuthStore } from '@/lib/store/authSlice';
import { useListingsStore } from '@/lib/store/listingsSlice';
import { Listing } from '@/types';
import { formatNaira } from '@/lib/utils/currency';
import { canAccessAgent } from '@/lib/utils/guards';
import { useRouter } from 'next/navigation';

export default function AgentDashboard() {
	const { user } = useAuthStore();
	const { getListingsByAgent } = useListingsStore();
	const router = useRouter();

	const [listings, setListings] = useState<Listing[]>([]);
	const [stats, setStats] = useState({
		totalListings: 0,
		activeListings: 0,
		totalViews: 0,
		totalEarnings: 0
	});

	useEffect(() => {
		if (!user || !canAccessAgent(user.role)) {
			router.push('/');
			return;
		}

		const agentListings = getListingsByAgent(user.id);
		setListings(agentListings);

		// Calculate stats
		const totalListings = agentListings.length;
		const activeListings = agentListings.filter(
			(l) => l.status === 'available'
		).length;
		const totalViews = agentListings.reduce((sum, l) => sum + l.views, 0);
		const totalEarnings = totalViews * 100; // Mock earnings calculation

		setStats({
			totalListings,
			activeListings,
			totalViews,
			totalEarnings
		});
	}, [user, getListingsByAgent, router]);

	if (!user || !canAccessAgent(user.role)) {
		return null;
	}

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
							<div className='text-2xl font-bold'>{stats.totalListings}</div>
							<p className='text-xs text-muted-foreground'>
								{stats.activeListings} active
							</p>
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
							<div className='text-2xl font-bold'>{stats.totalViews}</div>
							<p className='text-xs text-muted-foreground'>
								+12% from last month
							</p>
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
							<div className='text-2xl font-bold'>
								{formatNaira(stats.totalEarnings)}
							</div>
							<p className='text-xs text-muted-foreground'>This month</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.3 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Rating</CardTitle>
							<BarChart3 className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>4.8</div>
							<p className='text-xs text-muted-foreground'>
								Based on 24 reviews
							</p>
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
						{listings.length === 0 ? (
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
										<img
											src={listing.coverPhoto}
											alt={listing.title}
											className='w-16 h-16 rounded-lg object-cover'
										/>
										<div className='flex-1 min-w-0'>
											<h4 className='font-semibold truncate'>
												{listing.title}
											</h4>
											<p className='text-sm text-muted-foreground'>
												{listing.campusArea}
											</p>
											<div className='flex items-center space-x-4 mt-1'>
												<span className='text-sm font-medium text-primary'>
													{formatNaira(listing.priceMonthly)}/month
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
