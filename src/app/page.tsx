'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	Search,
	MapPin,
	Users,
	Shield,
	Star,
	ArrowRight,
	Building2,
	Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { useListingsStore } from '@/lib/store/listingsSlice';
import { formatNaira } from '@/lib/utils/currency';
import { ClientOnly } from '@/components/providers/ClientOnly';

function HomeContent() {
	const [searchQuery, setSearchQuery] = useState('');
	const { listings } = useListingsStore();

	// Get featured listings (top rated and recent)
	const featuredListings = listings
		.filter((listing) => listing.status === 'available')
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 6);

	const stats = [
		{ label: 'Active Listings', value: '150+', icon: Building2 },
		{ label: 'Happy Students', value: '500+', icon: Users },
		{ label: 'Verified Agents', value: '25+', icon: Shield },
		{ label: 'Average Rating', value: '4.8', icon: Star }
	];

	const features = [
		{
			icon: Shield,
			title: 'Verified Agents',
			description:
				'All our agents are verified students with valid matric numbers and ID cards.'
		},
		{
			icon: MapPin,
			title: 'Prime Locations',
			description:
				'Properties located in safe, student-friendly areas near FUPRE campus.'
		},
		{
			icon: Users,
			title: 'Roommate Matching',
			description:
				'Find compatible roommates based on your preferences and lifestyle.'
		}
	];

	const testimonials = [
		{
			name: 'John Doe',
			role: 'Final Year Student',
			content:
				'Found my perfect apartment in Ugbomro through this platform. The agent was very helpful and the process was smooth.',
			rating: 5
		},
		{
			name: 'Mary Johnson',
			role: 'Graduate Student',
			content:
				'Great platform for finding roommates. Met my current roommate here and we get along perfectly!',
			rating: 5
		},
		{
			name: 'David Wilson',
			role: 'Undergraduate',
			content:
				"The verification process gives me confidence that I'm dealing with legitimate agents. Highly recommended!",
			rating: 5
		}
	];

	return (
		<div className='min-h-screen'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10'>
				<div className='container mx-auto px-4 py-20'>
					<div className='text-center space-y-8'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className='space-y-4'>
							<Badge
								variant='secondary'
								className='inline-flex items-center space-x-2'>
								<Heart className='h-3 w-3' />
								<span>Trusted by 500+ FUPRE Students</span>
							</Badge>

							<h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
								Find Your Perfect
								<br />
								Student Housing
							</h1>

							<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
								Connect with verified agents and fellow students to find quality
								accommodation near Federal University of Petroleum Resources,
								Effurun.
							</p>
						</motion.div>

						{/* Search Bar */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className='max-w-2xl mx-auto'>
							<div className='flex flex-col sm:flex-row gap-4 p-2 bg-background rounded-lg shadow-lg border'>
								<div className='flex-1 relative'>
									<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
									<Input
										type='text'
										placeholder='Search by location, price, or amenities...'
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className='pl-10 border-0 focus-visible:ring-0'
									/>
								</div>
								<Link
									href={`/listings${
										searchQuery
											? `?search=${encodeURIComponent(searchQuery)}`
											: ''
									}`}>
									<Button size='lg' className='w-full sm:w-auto'>
										Search Listings
										<ArrowRight className='ml-2 h-4 w-4' />
									</Button>
								</Link>
							</div>
						</motion.div>

						{/* CTA Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link href='/listings'>
								<Button size='lg' variant='default'>
									<Building2 className='mr-2 h-5 w-5' />
									Browse Listings
								</Button>
							</Link>
							<Link href='/roommates'>
								<Button size='lg' variant='outline'>
									<Users className='mr-2 h-5 w-5' />
									Find Roommates
								</Button>
							</Link>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className='py-16 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
						{stats.map((stat, index) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className='text-center space-y-2'>
								<div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary'>
									<stat.icon className='h-6 w-6' />
								</div>
								<div className='text-2xl font-bold'>{stat.value}</div>
								<div className='text-sm text-muted-foreground'>
									{stat.label}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20'>
				<div className='container mx-auto px-4'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='text-center space-y-4 mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold'>
							Why Choose FUPRE Housing?
						</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							We make finding student accommodation simple, safe, and
							affordable.
						</p>
					</motion.div>

					<div className='grid md:grid-cols-3 gap-8'>
						{features.map((feature, index) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.2 }}>
								<Card className='h-full text-center'>
									<CardContent className='p-8 space-y-4'>
										<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary'>
											<feature.icon className='h-8 w-8' />
										</div>
										<h3 className='text-xl font-semibold'>{feature.title}</h3>
										<p className='text-muted-foreground'>
											{feature.description}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Listings */}
			<section className='py-20 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='text-center space-y-4 mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold'>
							Featured Listings
						</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Discover our top-rated properties near FUPRE campus.
						</p>
					</motion.div>

					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{featuredListings.map((listing, index) => (
							<motion.div
								key={listing.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}>
								<Card className='overflow-hidden hover:shadow-lg transition-shadow'>
									<div className='relative'>
										<img
											src={listing.coverPhoto}
											alt={listing.title}
											className='w-full h-48 object-cover'
										/>
										<Badge
											variant={
												listing.status === 'available' ? 'success' : 'secondary'
											}
											className='absolute top-2 right-2'>
											{listing.status}
										</Badge>
									</div>
									<CardContent className='p-4 space-y-3'>
										<h3 className='font-semibold line-clamp-1'>
											{listing.title}
										</h3>
										<div className='flex items-center space-x-2 text-sm text-muted-foreground'>
											<MapPin className='h-4 w-4' />
											<span>{listing.campusArea}</span>
										</div>
										<div className='flex items-center justify-between'>
											<span className='text-lg font-bold text-primary'>
												{formatNaira(listing.priceMonthly)}/month
											</span>
											<div className='flex items-center space-x-1'>
												<Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
												<span className='text-sm'>{listing.rating}</span>
											</div>
										</div>
										<Link href={`/listings/${listing.id}`}>
											<Button className='w-full' size='sm'>
												View Details
											</Button>
										</Link>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className='text-center mt-12'>
						<Link href='/listings'>
							<Button size='lg' variant='outline'>
								View All Listings
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</Link>
					</motion.div>
				</div>
			</section>

			{/* Testimonials */}
			<section className='py-20'>
				<div className='container mx-auto px-4'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='text-center space-y-4 mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold'>
							What Students Say
						</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Hear from students who found their perfect home through our
							platform.
						</p>
					</motion.div>

					<div className='grid md:grid-cols-3 gap-8'>
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={testimonial.name}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.2 }}>
								<Card className='h-full'>
									<CardContent className='p-6 space-y-4'>
										<div className='flex items-center space-x-1'>
											{[...Array(testimonial.rating)].map((_, i) => (
												<Star
													key={i}
													className='h-4 w-4 fill-yellow-400 text-yellow-400'
												/>
											))}
										</div>
										<p className='text-muted-foreground italic'>
											&ldquo;{testimonial.content}&rdquo;
										</p>
										<div>
											<div className='font-semibold'>{testimonial.name}</div>
											<div className='text-sm text-muted-foreground'>
												{testimonial.role}
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 bg-gradient-to-r from-primary to-primary/80 text-white'>
				<div className='container mx-auto px-4 text-center'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='space-y-8'>
						<h2 className='text-3xl md:text-4xl font-bold'>
							Ready to Find Your Perfect Home?
						</h2>
						<p className='text-xl opacity-90 max-w-2xl mx-auto'>
							Join hundreds of FUPRE students who have found their ideal
							accommodation through our trusted platform.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link href='/auth/register'>
								<Button size='lg' variant='secondary'>
									Get Started Today
									<ArrowRight className='ml-2 h-4 w-4' />
								</Button>
							</Link>
							<Link href='/listings'>
								<Button
									size='lg'
									variant='outline'
									className='border-white text-white hover:bg-white hover:text-primary'>
									Browse Listings
								</Button>
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}

export default function Home() {
	return (
		<ClientOnly
			fallback={
				<div className='min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800'>
					<div className='container mx-auto px-4 py-16'>
						<div className='text-center'>
							<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
								FUPRE Housing Platform
							</h1>
							<p className='text-lg text-gray-600 dark:text-gray-300 mb-8'>
								Loading...
							</p>
						</div>
					</div>
				</div>
			}>
			<HomeContent />
		</ClientOnly>
	);
}
