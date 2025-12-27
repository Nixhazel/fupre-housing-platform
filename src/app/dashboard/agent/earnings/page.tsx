'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	TrendingUp,
	DollarSign,
	Calendar,
	BarChart3,
	Download,
	Eye,
	Building2,
	Loader2,
	AlertCircle,
	FileText,
	FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Skeleton } from '@/components/shared/Skeleton';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatUnlockFee } from '@/lib/config/env';
import {
	useAgentEarnings,
	useAgentStats,
	useAgentListings
} from '@/hooks/api/useAgent';
import { formatNaira } from '@/lib/utils/currency';
import { canAccessAgent } from '@/lib/utils/guards';
import {
	exportEarningsToCSV,
	exportEarningsToPDF,
	type EarningsExportData
} from '@/lib/utils/export';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AgentEarningsPage() {
	const { user, isLoading: authLoading } = useAuth();

	const [selectedMonths, setSelectedMonths] = useState<number>(6);

	// TanStack Query hooks
	const { data: statsData, isLoading: statsLoading } = useAgentStats({
		enabled: !!user && canAccessAgent(user?.role || '')
	});
	const { data: earningsData, isLoading: earningsLoading } = useAgentEarnings(
		selectedMonths,
		{
			enabled: !!user && canAccessAgent(user?.role || '')
		}
	);
	const { data: listingsData, isLoading: listingsLoading } = useAgentListings(
		{ sortBy: 'views', limit: 5 },
		{ enabled: !!user && canAccessAgent(user?.role || '') }
	);

	// statsData is now AgentStats directly (not { stats: AgentStats })
	const stats = statsData;
	const earnings = earningsData?.earnings ?? [];
	const listings = listingsData?.listings ?? [];

	const isLoading = statsLoading || earningsLoading || listingsLoading;

	// Calculate growth percentage from earnings data
	const getGrowthPercentage = () => {
		if (earnings.length < 2) return 0;
		const current = earnings[0]?.amount || 0;
		const previous = earnings[1]?.amount || 0;
		if (previous === 0) return current > 0 ? 100 : 0;
		return Math.round(((current - previous) / previous) * 100);
	};

	// Build export data
	const getExportData = (): EarningsExportData => {
		const periodLabel =
			selectedMonths === 3
				? 'Last 3 Months'
				: selectedMonths === 6
				? 'Last 6 Months'
				: 'Last 12 Months';

		return {
			agentName: user?.name || 'Agent',
			agentEmail: user?.email || '',
			period: periodLabel,
			totalEarnings: stats?.totalEarnings ?? 0,
			totalUnlocks: stats?.totalUnlocks ?? 0,
			totalViews: stats?.totalViews ?? 0,
			monthlyData: earnings.map((e) => ({
				month: e.month,
				unlocks: e.unlocks,
				amount: e.amount
			})),
			topListings: listings.map((l) => ({
				title: l.title,
				area: l.campusArea,
				price: l.priceMonthly,
				views: l.views
			})),
			exportDate: new Date().toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
		};
	};

	const handleExportCSV = () => {
		try {
			const data = getExportData();
			exportEarningsToCSV(data);
			toast.success('CSV report downloaded successfully!');
		} catch {
			toast.error('Failed to export CSV');
		}
	};

	const handleExportPDF = () => {
		try {
			const data = getExportData();
			exportEarningsToPDF(data);
			toast.success('PDF report opened in new window');
		} catch {
			toast.error('Failed to generate PDF');
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
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button disabled={isLoading}>
								<Download className='h-4 w-4 mr-2' />
								Export Report
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onClick={handleExportPDF}>
								<FileText className='h-4 w-4 mr-2' />
								Export as PDF
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleExportCSV}>
								<FileSpreadsheet className='h-4 w-4 mr-2' />
								Export as CSV
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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
								variant={selectedMonths === 3 ? 'default' : 'outline'}
								onClick={() => setSelectedMonths(3)}
								size='sm'>
								Last 3 Months
							</Button>
							<Button
								variant={selectedMonths === 6 ? 'default' : 'outline'}
								onClick={() => setSelectedMonths(6)}
								size='sm'>
								Last 6 Months
							</Button>
							<Button
								variant={selectedMonths === 12 ? 'default' : 'outline'}
								onClick={() => setSelectedMonths(12)}
								size='sm'>
								Last Year
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				{isLoading ? (
					<>
						{[...Array(4)].map((_, i) => (
							<Card key={i}>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-4 w-4' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-8 w-20 mb-1' />
									<Skeleton className='h-3 w-16' />
								</CardContent>
							</Card>
						))}
					</>
				) : (
					<>
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
										{formatNaira(stats?.totalEarnings ?? 0)}
									</div>
									<div className='flex items-center gap-1 text-xs'>
										{growthPercentage >= 0 ? (
											<>
												<TrendingUp className='h-3 w-3 text-green-600' />
												<span className='text-green-600'>
													+{growthPercentage}%
												</span>
											</>
										) : (
											<>
												<TrendingUp className='h-3 w-3 text-red-600 rotate-180' />
												<span className='text-red-600'>
													{growthPercentage}%
												</span>
											</>
										)}
										<span className='text-muted-foreground'>
											vs last period
										</span>
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
									<CardTitle className='text-sm font-medium'>
										Total Views
									</CardTitle>
									<Eye className='h-4 w-4 text-muted-foreground' />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{stats?.totalViews ?? 0}
									</div>
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
									<div className='text-2xl font-bold'>
										{stats?.totalUnlocks ?? 0}
									</div>
									<p className='text-xs text-muted-foreground'>
										{formatUnlockFee()} per unlock
									</p>
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
										{(stats?.totalViews ?? 0) > 0
											? Math.round(
													((stats?.totalUnlocks ?? 0) /
														(stats?.totalViews ?? 1)) *
														100
											  )
											: 0}
										%
									</div>
									<p className='text-xs text-muted-foreground'>
										Views to unlocks
									</p>
								</CardContent>
							</Card>
						</motion.div>
					</>
				)}
			</div>

			{/* Earnings History */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.4 }}
				className='mb-8'>
				<Card>
					<CardHeader>
						<CardTitle>Monthly Earnings</CardTitle>
					</CardHeader>
					<CardContent>
						{earningsLoading ? (
							<div className='space-y-4'>
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className='flex items-center justify-between p-4 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<Skeleton className='h-5 w-5' />
											<div>
												<Skeleton className='h-5 w-24 mb-1' />
												<Skeleton className='h-4 w-32' />
											</div>
										</div>
										<Skeleton className='h-6 w-20' />
									</div>
								))}
							</div>
						) : earnings.length === 0 ? (
							<div className='text-center py-8'>
								<BarChart3 className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
								<h3 className='text-lg font-semibold mb-2'>
									No earnings data yet
								</h3>
								<p className='text-muted-foreground'>
									Start listing properties to see your earnings here
								</p>
							</div>
						) : (
							<div className='space-y-4'>
								{earnings.map((data, index) => (
									<div
										key={data.month}
										className='flex items-center justify-between p-4 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<Calendar className='h-5 w-5 text-muted-foreground' />
											<div>
												<h3 className='font-medium'>{data.month}</h3>
												<p className='text-sm text-muted-foreground'>
													{data.unlocks} unlocks
												</p>
											</div>
										</div>
										<div className='text-right'>
											<div className='text-lg font-bold text-primary'>
												{formatNaira(data.amount)}
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
						)}
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
						{listingsLoading ? (
							<div className='space-y-4'>
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className='flex items-center justify-between p-4 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<Skeleton className='w-8 h-8 rounded-full' />
											<div>
												<Skeleton className='h-5 w-32 mb-1' />
												<Skeleton className='h-4 w-40' />
											</div>
										</div>
										<div className='text-right'>
											<Skeleton className='h-6 w-12 mb-1' />
											<Skeleton className='h-3 w-10' />
										</div>
									</div>
								))}
							</div>
						) : listings.length === 0 ? (
							<div className='text-center py-8'>
								<Building2 className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
								<h3 className='text-lg font-semibold mb-2'>No listings yet</h3>
								<p className='text-muted-foreground mb-4'>
									Create your first listing to start tracking performance
								</p>
								<Button asChild>
									<Link href='/dashboard/agent/listings/new'>
										Create Listing
									</Link>
								</Button>
							</div>
						) : (
							<div className='space-y-4'>
								{listings.map((listing, index) => (
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
						)}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
