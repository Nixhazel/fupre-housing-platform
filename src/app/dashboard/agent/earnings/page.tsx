'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	TrendingUp,
	DollarSign,
	Calendar,
	BarChart3,
	Download,
	Eye,
	Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { useAuthStore } from '@/lib/store/authSlice';
import { useListingsStore } from '@/lib/store/listingsSlice';
import { Listing } from '@/types';
import { formatNaira } from '@/lib/utils/currency';
import { canAccessAgent } from '@/lib/utils/guards';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EarningsData {
	period: string;
	earnings: number;
	views: number;
	unlocks: number;
}

export default function AgentEarningsPage() {
	const { user } = useAuthStore();
	const { getListingsByAgent } = useListingsStore();
	const router = useRouter();

	const [listings, setListings] = useState<Listing[]>([]);
	const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
	const [selectedPeriod, setSelectedPeriod] = useState<
		'week' | 'month' | 'year'
	>('month');

	useEffect(() => {
		if (!user || !canAccessAgent(user.role)) {
			router.push('/');
			return;
		}

		const agentListings = getListingsByAgent(user.id);
		setListings(agentListings);

		// Mock earnings data
		const mockEarningsData: EarningsData[] = [
			{ period: 'This Week', earnings: 15000, views: 45, unlocks: 15 },
			{ period: 'Last Week', earnings: 12000, views: 38, unlocks: 12 },
			{ period: 'This Month', earnings: 65000, views: 180, unlocks: 65 },
			{ period: 'Last Month', earnings: 58000, views: 165, unlocks: 58 },
			{ period: 'This Year', earnings: 750000, views: 2100, unlocks: 750 },
			{ period: 'Last Year', earnings: 680000, views: 1950, unlocks: 680 }
		];
		setEarningsData(mockEarningsData);
	}, [user, getListingsByAgent, router]);

	const getCurrentPeriodData = () => {
		switch (selectedPeriod) {
			case 'week':
				return earningsData.slice(0, 2);
			case 'month':
				return earningsData.slice(2, 4);
			case 'year':
				return earningsData.slice(4, 6);
			default:
				return earningsData.slice(2, 4);
		}
	};

	const getTotalEarnings = () => {
		const currentData = getCurrentPeriodData();
		return currentData[0]?.earnings || 0;
	};

	const getTotalViews = () => {
		const currentData = getCurrentPeriodData();
		return currentData[0]?.views || 0;
	};

	const getTotalUnlocks = () => {
		const currentData = getCurrentPeriodData();
		return currentData[0]?.unlocks || 0;
	};

	const getGrowthPercentage = () => {
		const currentData = getCurrentPeriodData();
		if (currentData.length < 2) return 0;
		const current = currentData[0]?.earnings || 0;
		const previous = currentData[1]?.earnings || 0;
		if (previous === 0) return 0;
		return Math.round(((current - previous) / previous) * 100);
	};

	const handleExportEarnings = () => {
		toast.success('Earnings report exported successfully!');
	};

	if (!user || !canAccessAgent(user.role)) {
		return null;
	}

	const currentData = getCurrentPeriodData();
	const growthPercentage = getGrowthPercentage();

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>Earnings Dashboard</h1>
						<p className='text-muted-foreground'>
							Track your earnings and performance metrics
						</p>
					</div>
					<Button onClick={handleExportEarnings}>
						<Download className='h-4 w-4 mr-2' />
						Export Report
					</Button>
				</div>
			</div>

			{/* Period Selector */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='mb-6'>
				<Card>
					<CardContent className='pt-6'>
						<div className='flex gap-2'>
							<Button
								variant={selectedPeriod === 'week' ? 'default' : 'outline'}
								onClick={() => setSelectedPeriod('week')}
								size='sm'>
								This Week
							</Button>
							<Button
								variant={selectedPeriod === 'month' ? 'default' : 'outline'}
								onClick={() => setSelectedPeriod('month')}
								size='sm'>
								This Month
							</Button>
							<Button
								variant={selectedPeriod === 'year' ? 'default' : 'outline'}
								onClick={() => setSelectedPeriod('year')}
								size='sm'>
								This Year
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Earnings
							</CardTitle>
							<DollarSign className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{formatNaira(getTotalEarnings())}
							</div>
							<div className='flex items-center gap-1 text-xs'>
								{growthPercentage > 0 ? (
									<>
										<TrendingUp className='h-3 w-3 text-green-600' />
										<span className='text-green-600'>+{growthPercentage}%</span>
									</>
								) : (
									<>
										<TrendingUp className='h-3 w-3 text-red-600 rotate-180' />
										<span className='text-red-600'>{growthPercentage}%</span>
									</>
								)}
								<span className='text-muted-foreground'>vs last period</span>
							</div>
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
							<div className='text-2xl font-bold'>{getTotalViews()}</div>
							<p className='text-xs text-muted-foreground'>
								Across all listings
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
							<CardTitle className='text-sm font-medium'>
								Location Unlocks
							</CardTitle>
							<Building2 className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{getTotalUnlocks()}</div>
							<p className='text-xs text-muted-foreground'>₦1,000 per unlock</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.3 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Conversion Rate
							</CardTitle>
							<BarChart3 className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{getTotalViews() > 0
									? Math.round((getTotalUnlocks() / getTotalViews()) * 100)
									: 0}
								%
							</div>
							<p className='text-xs text-muted-foreground'>Views to unlocks</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Earnings History */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.4 }}
				className='mb-8'>
				<Card>
					<CardHeader>
						<CardTitle>Earnings History</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{currentData.map((data, index) => (
								<div
									key={index}
									className='flex items-center justify-between p-4 rounded-lg bg-muted/50'>
									<div className='flex items-center gap-3'>
										<Calendar className='h-5 w-5 text-muted-foreground' />
										<div>
											<h3 className='font-medium'>{data.period}</h3>
											<p className='text-sm text-muted-foreground'>
												{data.views} views • {data.unlocks} unlocks
											</p>
										</div>
									</div>
									<div className='text-right'>
										<div className='text-lg font-bold text-primary'>
											{formatNaira(data.earnings)}
										</div>
										{index === 0 && growthPercentage !== 0 && (
											<Badge
												variant={
													growthPercentage > 0 ? 'default' : 'secondary'
												}>
												{growthPercentage > 0 ? '+' : ''}
												{growthPercentage}%
											</Badge>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Top Performing Listings */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.5 }}>
				<Card>
					<CardHeader>
						<CardTitle>Top Performing Listings</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{listings
								.sort((a, b) => b.views - a.views)
								.slice(0, 5)
								.map((listing, index) => (
									<div
										key={listing.id}
										className='flex items-center justify-between p-4 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold'>
												{index + 1}
											</div>
											<div>
												<h3 className='font-medium line-clamp-1'>
													{listing.title}
												</h3>
												<p className='text-sm text-muted-foreground'>
													{listing.campusArea} •{' '}
													{formatNaira(listing.priceMonthly)}/month
												</p>
											</div>
										</div>
										<div className='text-right'>
											<div className='text-lg font-bold'>{listing.views}</div>
											<p className='text-sm text-muted-foreground'>views</p>
										</div>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
