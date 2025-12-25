'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	HelpCircle,
	Search,
	ChevronDown,
	ChevronUp,
	Mail,
	Phone,
	MessageCircle,
	BookOpen,
	Shield,
	CreditCard,
	MapPin,
	Users,
	Building2,
	FileText,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Separator } from '@/components/ui/separator';

interface FAQItem {
	id: string;
	question: string;
	answer: string;
	category: string;
	icon: React.ComponentType<{ className?: string }>;
}

const faqData: FAQItem[] = [
	{
		id: '1',
		question: 'How do I find housing near campus?',
		answer:
			'Use our search filters to find listings by location (Ugbomro, Effurun, Enerhen, PTI Road), price range, and amenities. You can also browse featured listings on our homepage.',
		category: 'Finding Housing',
		icon: MapPin
	},
	{
		id: '2',
		question: 'How does the location unlock feature work?',
		answer:
			'To see the full address and contact details of a listing, you need to pay ₦1,000 and submit payment proof. Our admin team will review and approve your request within 24 hours.',
		category: 'Finding Housing',
		icon: CreditCard
	},
	{
		id: '3',
		question: 'What payment methods are accepted?',
		answer:
			'We accept bank transfers, USSD payments, and POS transactions. After payment, upload a screenshot or photo of your payment receipt for verification.',
		category: 'Payments',
		icon: CreditCard
	},
	{
		id: '4',
		question: 'How do I become a verified agent?',
		answer:
			'To become a verified agent, you need to be a current student with a valid matric number and student ID. Contact our admin team for verification.',
		category: 'Agents',
		icon: Shield
	},
	{
		id: '5',
		question: 'How do I create a roommate listing?',
		answer:
			'Click "New Listing" on the roommates page, fill in your preferences (gender, cleanliness, study hours, etc.), add photos, and set your budget. Your listing will be visible to other students.',
		category: 'Roommates',
		icon: Users
	},
	{
		id: '6',
		question: 'What if I have issues with a listing?',
		answer:
			'Contact our support team immediately. We take all reports seriously and will investigate any issues with listings, agents, or payments.',
		category: 'Support',
		icon: AlertCircle
	},
	{
		id: '7',
		question: 'How long does payment verification take?',
		answer:
			'Payment verification typically takes 24 hours. You&apos;ll receive a notification once your payment proof is approved and you can access the full listing details.',
		category: 'Payments',
		icon: Clock
	},
	{
		id: '8',
		question: 'Can I save listings for later?',
		answer:
			'Yes! Click the heart icon on any listing to save it to your favorites. You can view all saved listings in your profile.',
		category: 'Using the Platform',
		icon: CheckCircle
	},
	{
		id: '9',
		question: 'How do I contact a property owner?',
		answer:
			"After unlocking a listing, you'll see the full contact details including phone number and address. You can also use our messaging system if available.",
		category: 'Finding Housing',
		icon: MessageCircle
	},
	{
		id: '10',
		question: 'What should I do if a listing is no longer available?',
		answer:
			'Report the listing using the "Report" button. Our team will mark it as unavailable and remove it from search results.',
		category: 'Support',
		icon: XCircle
	}
];

const categories = [
	{ name: 'All', icon: BookOpen },
	{ name: 'Finding Housing', icon: MapPin },
	{ name: 'Payments', icon: CreditCard },
	{ name: 'Agents', icon: Building2 },
	{ name: 'Roommates', icon: Users },
	{ name: 'Support', icon: HelpCircle },
	{ name: 'Using the Platform', icon: FileText }
];

function HelpContent() {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [expandedItems, setExpandedItems] = useState<string[]>([]);

	const filteredFAQs = faqData.filter((faq) => {
		const matchesSearch =
			faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
			faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategory === 'All' || faq.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const toggleExpanded = (id: string) => {
		setExpandedItems((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='text-center mb-12'>
					<h1 className='text-4xl font-bold mb-4'>Help & Support</h1>
				<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
					Find answers to common questions and get help with using
					EasyVille Estates.
				</p>
				</motion.div>

				{/* Search */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='max-w-2xl mx-auto mb-8'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
						<Input
							placeholder='Search for help...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10 h-12 text-lg'
						/>
					</div>
				</motion.div>

				{/* Categories */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className='mb-8'>
					<div className='flex flex-wrap gap-2 justify-center'>
						{categories.map((category) => (
							<Button
								key={category.name}
								variant={
									selectedCategory === category.name ? 'default' : 'outline'
								}
								onClick={() => setSelectedCategory(category.name)}
								className='flex items-center gap-2'>
								<category.icon className='h-4 w-4' />
								{category.name}
							</Button>
						))}
					</div>
				</motion.div>

				{/* FAQ Results */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className='max-w-4xl mx-auto'>
					{filteredFAQs.length === 0 ? (
						<Card>
							<CardContent className='text-center py-12'>
								<HelpCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
								<h3 className='text-lg font-semibold mb-2'>No results found</h3>
								<p className='text-muted-foreground'>
									Try adjusting your search terms or browse different
									categories.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className='space-y-4'>
							{filteredFAQs.map((faq, index) => (
								<motion.div
									key={faq.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}>
									<Card className='overflow-hidden'>
										<CardHeader
											className='cursor-pointer hover:bg-muted/50 transition-colors'
											onClick={() => toggleExpanded(faq.id)}>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-3'>
													<faq.icon className='h-5 w-5 text-primary' />
													<div>
														<CardTitle className='text-left'>
															{faq.question}
														</CardTitle>
														<Badge variant='outline' className='mt-1'>
															{faq.category}
														</Badge>
													</div>
												</div>
												{expandedItems.includes(faq.id) ? (
													<ChevronUp className='h-5 w-5 text-muted-foreground' />
												) : (
													<ChevronDown className='h-5 w-5 text-muted-foreground' />
												)}
											</div>
										</CardHeader>
										{expandedItems.includes(faq.id) && (
											<CardContent className='pt-0'>
												<Separator className='mb-4' />
												<p className='text-muted-foreground leading-relaxed'>
													{faq.answer}
												</p>
											</CardContent>
										)}
									</Card>
								</motion.div>
							))}
						</div>
					)}
				</motion.div>

				{/* Contact Support */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className='max-w-4xl mx-auto mt-12'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<MessageCircle className='h-5 w-5' />
								Still need help?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-muted-foreground mb-6'>
								Can&apos;t find what you&apos;re looking for? Our support team
								is here to help.
							</p>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='text-center p-4 rounded-lg bg-muted/50'>
									<Mail className='h-8 w-8 text-primary mx-auto mb-2' />
									<h3 className='font-semibold mb-1'>Email Support</h3>
								<p className='text-sm text-muted-foreground mb-2'>
									support@easyvilleestates.com
								</p>
								<Button variant='outline' size='sm' asChild>
									<a href='mailto:support@easyvilleestates.com'>
											<Mail className='h-4 w-4 mr-2' />
											Send Email
										</a>
									</Button>
								</div>
								<div className='text-center p-4 rounded-lg bg-muted/50'>
									<Phone className='h-8 w-8 text-primary mx-auto mb-2' />
									<h3 className='font-semibold mb-1'>Phone Support</h3>
									<p className='text-sm text-muted-foreground mb-2'>
										+234 812 345 6789
									</p>
									<Button variant='outline' size='sm' asChild>
										<a href='tel:+2348123456789'>
											<Phone className='h-4 w-4 mr-2' />
											Call Now
										</a>
									</Button>
								</div>
								<div className='text-center p-4 rounded-lg bg-muted/50'>
									<MessageCircle className='h-8 w-8 text-primary mx-auto mb-2' />
									<h3 className='font-semibold mb-1'>WhatsApp</h3>
									<p className='text-sm text-muted-foreground mb-2'>
										Quick responses
									</p>
									<Button variant='outline' size='sm' asChild>
										<a href='https://wa.me/2348123456789' target='_blank' rel='noopener noreferrer'>
											<MessageCircle className='h-4 w-4 mr-2' />
											Chat on WhatsApp
										</a>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Quick Links */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className='max-w-4xl mx-auto mt-8'>
					<Card>
						<CardHeader>
							<CardTitle>Quick Links</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								<Button
									variant='outline'
									className='h-auto p-4 flex flex-col items-center gap-2'
									asChild>
									<Link href='/listings'>
										<Building2 className='h-6 w-6' />
										<span className='text-sm'>Browse Listings</span>
									</Link>
								</Button>
								<Button
									variant='outline'
									className='h-auto p-4 flex flex-col items-center gap-2'
									asChild>
									<Link href='/roommates'>
										<Users className='h-6 w-6' />
										<span className='text-sm'>Find Roommates</span>
									</Link>
								</Button>
								<Button
									variant='outline'
									className='h-auto p-4 flex flex-col items-center gap-2'
									asChild>
									<Link href='/auth/register?role=agent'>
										<Shield className='h-6 w-6' />
										<span className='text-sm'>Become an Agent</span>
									</Link>
								</Button>
								<Button
									variant='outline'
									className='h-auto p-4 flex flex-col items-center gap-2'
									asChild>
									<Link href='/terms'>
										<FileText className='h-6 w-6' />
										<span className='text-sm'>Terms of Service</span>
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}

export default function HelpPage() {
	return <HelpContent />;
}
