'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
	Home,
	Heart,
	Users,
	Unlock,
	Building2,
	ArrowRight,
	Loader2,
	AlertCircle,
	Search,
	UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSavedListings } from '@/hooks/api/useListings';
import { useSavedRoommates } from '@/hooks/api/useRoommates';
import { formatNaira } from '@/lib/utils/currency';

export default function StudentDashboardPage() {
	const { user, isLoading: isUserLoading, isAuthenticated } = useAuth();

	// Fetch saved data
	const { data: savedListingsData, isLoading: isListingsLoading } = useSavedListings({
		enabled: isAuthenticated
	});
	const { data: savedRoommatesData, isLoading: isRoommatesLoading } = useSavedRoommates({
		enabled: isAuthenticated
	});

	const savedListings = savedListingsData?.listings || [];
	const savedRoommates = savedRoommatesData?.listings || [];
	const unlockedCount = user?.unlockedListingIds?.length || 0;

	const isLoading = isUserLoading || isListingsLoading || isRoommatesLoading;

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
							Please log in to access your dashboard.
						</p>
						<Button asChild>
							<Link href='/auth/login?returnUrl=/dashboard/student'>Log In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const stats = [
		{
			label: 'Saved Listings',
			value: savedListings.length,
			icon: Heart,
			href: '/dashboard/student/saved-listings',
			color: 'text-red-500'
		},
		{
			label: 'Saved Roommates',
			value: savedRoommates.length,
			icon: Users,
			href: '/dashboard/student/saved-roommates',
			color: 'text-blue-500'
		},
		{
			label: 'Unlocked Listings',
			value: unlockedCount,
			icon: Unlock,
			href: '/listings',
			color: 'text-green-500'
		}
	];

	const quickActions = [
		{
			label: 'Browse Listings',
			description: 'Find your perfect accommodation',
			icon: Search,
			href: '/listings',
			variant: 'default' as const
		},
		{
			label: 'Find Roommates',
			description: 'Connect with compatible roommates',
			icon: Users,
			href: '/roommates',
			variant: 'outline' as const
		},
		{
			label: 'Create Roommate Listing',
			description: 'Let roommates find you',
			icon: UserPlus,
			href: '/roommates/new',
			variant: 'outline' as const
		}
	];

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8'>
					<div className='flex items-center gap-4 mb-2'>
						<div className='p-3 rounded-full bg-primary/10'>
							<Home className='h-6 w-6 text-primary' />
						</div>
						<div>
							<h1 className='text-3xl font-bold'>
								Welcome back, {user.name.split(' ')[0]}!
							</h1>
							<p className='text-muted-foreground'>
								Here&apos;s an overview of your housing search
							</p>
						</div>
					</div>
				</motion.div>

				{/* Stats Cards */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					{stats.map((stat, index) => (
						<Link key={index} href={stat.href}>
							<Card className='hover:shadow-md transition-shadow cursor-pointer'>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm text-muted-foreground'>
												{stat.label}
											</p>
											<p className='text-3xl font-bold'>{stat.value}</p>
										</div>
										<div className={`p-3 rounded-full bg-muted ${stat.color}`}>
											<stat.icon className='h-6 w-6' />
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</motion.div>

				{/* Quick Actions */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className='mb-8'>
					<h2 className='text-xl font-semibold mb-4'>Quick Actions</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{quickActions.map((action, index) => (
							<Button
								key={index}
								variant={action.variant}
								className='h-auto py-4 justify-start'
								asChild>
								<Link href={action.href}>
									<action.icon className='h-5 w-5 mr-3' />
									<div className='text-left'>
										<div className='font-semibold'>{action.label}</div>
										<div className='text-xs opacity-70'>{action.description}</div>
									</div>
								</Link>
							</Button>
						))}
					</div>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Recent Saved Listings */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between'>
								<CardTitle className='flex items-center gap-2'>
									<Heart className='h-5 w-5 text-red-500' />
									Saved Listings
								</CardTitle>
								{savedListings.length > 0 && (
									<Button variant='ghost' size='sm' asChild>
										<Link href='/dashboard/student/saved-listings'>
											View All
											<ArrowRight className='h-4 w-4 ml-1' />
										</Link>
									</Button>
								)}
							</CardHeader>
							<CardContent>
								{savedListings.length === 0 ? (
									<div className='text-center py-8'>
										<Building2 className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
										<p className='text-muted-foreground mb-4'>
											No saved listings yet
										</p>
										<Button variant='outline' size='sm' asChild>
											<Link href='/listings'>Browse Listings</Link>
										</Button>
									</div>
								) : (
									<div className='space-y-4'>
										{savedListings.slice(0, 3).map((listing) => (
											<Link
												key={listing.id}
												href={`/listings/${listing.id}`}
												className='flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors'>
												<div className='relative w-20 h-20 rounded-lg overflow-hidden shrink-0'>
													<Image
														src={listing.coverPhoto}
														alt={listing.title}
														fill
														className='object-cover'
														sizes='80px'
													/>
												</div>
												<div className='flex-1 min-w-0'>
													<h4 className='font-medium truncate'>
														{listing.title}
													</h4>
													<p className='text-sm text-muted-foreground'>
														{listing.campusArea}
													</p>
													<p className='text-sm font-semibold text-primary'>
														{formatNaira(listing.priceMonthly)}/month
													</p>
												</div>
												<Badge
													variant={
														listing.status === 'available'
															? 'success'
															: 'secondary'
													}>
													{listing.status}
												</Badge>
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>

					{/* Recent Saved Roommates */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between'>
								<CardTitle className='flex items-center gap-2'>
									<Users className='h-5 w-5 text-blue-500' />
									Saved Roommates
								</CardTitle>
								{savedRoommates.length > 0 && (
									<Button variant='ghost' size='sm' asChild>
										<Link href='/dashboard/student/saved-roommates'>
											View All
											<ArrowRight className='h-4 w-4 ml-1' />
										</Link>
									</Button>
								)}
							</CardHeader>
							<CardContent>
								{savedRoommates.length === 0 ? (
									<div className='text-center py-8'>
										<Users className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
										<p className='text-muted-foreground mb-4'>
											No saved roommate listings yet
										</p>
										<Button variant='outline' size='sm' asChild>
											<Link href='/roommates'>Find Roommates</Link>
										</Button>
									</div>
								) : (
									<div className='space-y-4'>
										{savedRoommates.slice(0, 3).map((listing) => (
											<Link
												key={listing.id}
												href={`/roommates/${listing.id}`}
												className='flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors'>
												<div className='relative w-20 h-20 rounded-lg overflow-hidden shrink-0'>
													{listing.photos?.[0] ? (
														<Image
															src={listing.photos[0]}
															alt={listing.title}
															fill
															className='object-cover'
															sizes='80px'
														/>
													) : (
														<div className='w-full h-full bg-muted flex items-center justify-center'>
															<Users className='h-8 w-8 text-muted-foreground' />
														</div>
													)}
												</div>
												<div className='flex-1 min-w-0'>
													<h4 className='font-medium truncate'>
														{listing.title}
													</h4>
													<p className='text-sm text-muted-foreground'>
														Budget: {formatNaira(listing.budgetMonthly)}/month
													</p>
													<p className='text-xs text-muted-foreground'>
														{listing.ownerType === 'owner'
															? 'Property Owner'
															: 'Student'}
													</p>
												</div>
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Tips Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className='mt-8'>
					<Card className='bg-primary/5 border-primary/20'>
						<CardContent className='pt-6'>
							<h3 className='font-semibold mb-3'>💡 Tips for Finding Housing</h3>
							<ul className='text-sm text-muted-foreground space-y-2'>
								<li>• Save listings you like to compare them later</li>
								<li>• Unlock listings to get the exact address and agent contact</li>
								<li>• Check the distance to campus before making a decision</li>
								<li>• Read the description carefully for amenities and rules</li>
								<li>• Create a roommate listing if you&apos;re looking for someone to share with</li>
							</ul>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}

