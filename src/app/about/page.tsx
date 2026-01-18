'use client';

import { motion } from 'framer-motion';
import {
	ArrowLeft,
	Building2,
	Users,
	Shield,
	Target,
	Heart,
	Zap,
	MapPin,
	Phone,
	Mail,
	CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PLATFORM_CONFIG } from '@/lib/config/env';

// Calculate agent commission for display
const AGENT_EARNINGS_PER_UNLOCK = Math.round(PLATFORM_CONFIG.UNLOCK_FEE * PLATFORM_CONFIG.AGENT_COMMISSION_RATE);

export default function AboutPage() {
	const values = [
		{
			icon: Shield,
			title: 'Trust & Safety',
			description: 'All agents are verified students ensuring a secure community.'
		},
		{
			icon: Heart,
			title: 'Student-Focused',
			description: 'Built by students, for students. We understand your needs.'
		},
		{
			icon: Zap,
			title: 'Simplicity',
			description: 'Find your perfect accommodation in just a few clicks.'
		},
		{
			icon: Target,
			title: 'Quality',
			description: 'Only the best listings make it to our platform.'
		}
	];

	const stats = [
		{ value: '500+', label: 'Listed Properties' },
		{ value: '2,000+', label: 'Happy Students' },
		{ value: '50+', label: 'Verified Agents' },
		{ value: '5', label: 'Campus Areas' }
	];

	const howItWorks = [
		{
			step: 1,
			title: 'Browse Listings',
			description: 'Explore verified property listings near campus with photos and details.'
		},
		{
			step: 2,
			title: 'Unlock Location',
			description: 'Pay a small fee to unlock the exact address and agent contact information.'
		},
		{
			step: 3,
			title: 'Contact Agent',
			description: 'Reach out directly to the agent to schedule a viewing and secure your accommodation.'
		}
	];

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8 max-w-5xl'>
				{/* Back Button */}
				<Button variant='ghost' asChild className='mb-6'>
					<Link href='/'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Home
					</Link>
				</Button>

				{/* Hero Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='text-center mb-16'>
					<div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6'>
						<Building2 className='h-10 w-10' />
					</div>
					<h1 className='text-4xl md:text-5xl font-bold mb-6'>
						About EasyVille Estates
					</h1>
					<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
						Connecting students with quality, verified accommodation near 
						Federal University of Petroleum Resources, Effurun.
					</p>
				</motion.div>

				{/* Mission Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}>
					<Card className='mb-12'>
						<CardHeader>
							<CardTitle className='text-2xl'>Our Mission</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-lg dark:prose-invert max-w-none'>
							<p>
								EasyVille Estates was created to solve the housing challenges faced by 
								students at FUPRE. Finding safe, affordable, and quality accommodation 
								near campus shouldn&apos;t be stressful.
							</p>
							<p>
								Our platform connects students with verified Independent Student Agents (ISAs) 
								who are fellow students themselves. This peer-to-peer approach ensures trust, 
								transparency, and a deeper understanding of student needs.
							</p>
						</CardContent>
					</Card>
				</motion.div>

				{/* Stats */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className='grid grid-cols-2 md:grid-cols-4 gap-6 mb-12'>
					{stats.map((stat, index) => (
						<Card key={index} className='text-center'>
							<CardContent className='pt-6'>
								<div className='text-3xl md:text-4xl font-bold text-primary mb-2'>
									{stat.value}
								</div>
								<p className='text-sm text-muted-foreground'>{stat.label}</p>
							</CardContent>
						</Card>
					))}
				</motion.div>

				{/* How It Works */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className='mb-12'>
					<h2 className='text-2xl font-bold text-center mb-8'>How It Works</h2>
					<div className='grid md:grid-cols-3 gap-6'>
						{howItWorks.map((item) => (
							<Card key={item.step} className='relative'>
								<CardContent className='pt-8 text-center'>
									<div className='absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold'>
										{item.step}
									</div>
									<h3 className='font-semibold text-lg mb-2'>{item.title}</h3>
									<p className='text-sm text-muted-foreground'>
										{item.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</motion.div>

				{/* Values */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className='mb-12'>
					<h2 className='text-2xl font-bold text-center mb-8'>Our Values</h2>
					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{values.map((value, index) => (
							<Card key={index} className='text-center'>
								<CardContent className='pt-6'>
									<div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4'>
										<value.icon className='h-6 w-6' />
									</div>
									<h3 className='font-semibold mb-2'>{value.title}</h3>
									<p className='text-sm text-muted-foreground'>
										{value.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</motion.div>

				{/* Why Choose Us */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}>
					<Card className='mb-12'>
						<CardHeader>
							<CardTitle className='text-2xl'>Why Choose EasyVille Estates?</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid md:grid-cols-2 gap-4'>
								{[
									'All agents are verified FUPRE students',
									'Real photos of actual properties',
									'Transparent pricing with no hidden fees',
									'Easy roommate matching system',
									'Secure payment verification process',
									'Coverage of all major campus areas',
									'24/7 customer support',
									'Mobile-friendly platform'
								].map((item, index) => (
									<div key={index} className='flex items-center gap-3'>
										<CheckCircle className='h-5 w-5 text-green-500 shrink-0' />
										<span>{item}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* For Agents */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}>
					<Card className='mb-12 bg-primary/5 border-primary/20'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-2xl'>
								<Users className='h-6 w-6' />
								Become an Agent
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<p>
								Are you a student with access to quality accommodation? Join our network 
								of Independent Student Agents and earn money by helping fellow students 
								find housing.
							</p>
							<ul className='space-y-2'>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									Earn ₦{AGENT_EARNINGS_PER_UNLOCK.toLocaleString()} for every listing unlock
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									Manage your listings easily
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									Track your earnings in real-time
								</li>
							</ul>
							<Button asChild className='mt-4'>
								<Link href='/auth/register?role=agent'>
									Register as Agent
								</Link>
							</Button>
						</CardContent>
					</Card>
				</motion.div>

				{/* Contact Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7 }}>
					<Card>
						<CardHeader>
							<CardTitle className='text-2xl'>Contact Us</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid md:grid-cols-3 gap-6'>
								<div className='flex items-start gap-3'>
									<div className='p-2 rounded-lg bg-primary/10'>
										<MapPin className='h-5 w-5 text-primary' />
									</div>
									<div>
										<h4 className='font-semibold'>Address</h4>
										<p className='text-sm text-muted-foreground'>
											11 Asama Avenue, Osubi,
											<br />
											Delta State, Nigeria
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<div className='p-2 rounded-lg bg-primary/10'>
										<Phone className='h-5 w-5 text-primary' />
									</div>
									<div>
										<h4 className='font-semibold'>Phone</h4>
										<p className='text-sm text-muted-foreground'>
											+234 704 848 9342
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<div className='p-2 rounded-lg bg-primary/10'>
										<Mail className='h-5 w-5 text-primary' />
									</div>
									<div>
										<h4 className='font-semibold'>Email</h4>
										<p className='text-sm text-muted-foreground'>
											info@easyvilleestates.com
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className='text-center mt-12'>
					<h2 className='text-2xl font-bold mb-4'>Ready to Find Your Home?</h2>
					<p className='text-muted-foreground mb-6'>
						Browse our verified listings and find your perfect accommodation today.
					</p>
					<div className='flex justify-center gap-4'>
						<Button asChild size='lg'>
							<Link href='/listings'>Browse Listings</Link>
						</Button>
						<Button variant='outline' asChild size='lg'>
							<Link href='/help'>Get Help</Link>
						</Button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}

