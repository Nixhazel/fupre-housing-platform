'use client';

import { motion } from 'framer-motion';
import {
	ArrowLeft,
	FileText,
	AlertTriangle,
	Users,
	CreditCard,
	Ban,
	Scale,
	HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsOfServicePage() {
	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				{/* Back Button */}
				<Button variant='ghost' asChild className='mb-6'>
					<Link href='/'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Home
					</Link>
				</Button>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='text-center mb-12'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
						<FileText className='h-8 w-8' />
					</div>
					<h1 className='text-4xl font-bold mb-4'>Terms of Service</h1>
					<p className='text-muted-foreground'>Last updated: January 2025</p>
				</motion.div>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='space-y-8'>
					{/* Acceptance */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FileText className='h-5 w-5' />
								Acceptance of Terms
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>
								By accessing or using EasyVille Estates (&quot;the
								Platform&quot;), you agree to be bound by these Terms of
								Service. If you do not agree to these terms, please do not use
								our services.
							</p>
							<p>
								These terms apply to all users, including students, agents, and
								property owners.
							</p>
						</CardContent>
					</Card>

					{/* User Accounts */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Users className='h-5 w-5' />
								User Accounts
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<h4>Account Registration</h4>
							<ul>
								<li>
									You must provide accurate and complete information when
									creating an account
								</li>
								<li>
									You are responsible for maintaining the security of your
									account credentials
								</li>
								<li>You must be at least 18 years old to use this platform</li>
								<li>One person may not maintain multiple accounts</li>
							</ul>

							<h4>Account Types</h4>
							<ul>
								<li>
									<strong>Student:</strong> Can browse listings, save favorites,
									unlock locations, and create roommate listings.
								</li>
								<li>
									<strong>Agent:</strong> Can create and manage property
									listings, earn commissions from unlocks, and must be verified.
								</li>
								<li>
									<strong>Owner:</strong> Can list properties directly and
									create roommate listings.
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Payment Terms */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<CreditCard className='h-5 w-5' />
								Payment & Unlock Terms
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<h4>Listing Unlock Fees</h4>
							<ul>
								<li>
									A fee of ₦1,000 is required to unlock the full address and
									contact information for each listing
								</li>
								<li>
									Unlock fees are non-refundable once the information is
									revealed
								</li>
								<li>
									Payment must be made via bank transfer with proof uploaded
								</li>
								<li>Unlocks are tied to your account and remain accessible</li>
							</ul>

							<h4>Agent Earnings</h4>
							<ul>
								<li>Agents receive 70% of the unlock fee for their listings</li>
								<li>
									Earnings are tracked and can be viewed in the agent dashboard
								</li>
								<li>
									Withdrawal requests are processed within 7 business days
								</li>
							</ul>

							<h4>Refund Policy</h4>
							<p>
								Due to the nature of digital information, refunds are generally
								not provided once a listing has been unlocked. However, we may
								consider refunds in cases of fraudulent listings or technical
								errors.
							</p>
						</CardContent>
					</Card>

					{/* Agent Obligations */}
					<Card>
						<CardHeader>
							<CardTitle>Agent & Owner Obligations</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>Agents and property owners must:</p>
							<ul>
								<li>
									Provide accurate and truthful information about properties
								</li>
								<li>Upload real, unedited photos of the actual property</li>
								<li>Keep listing information up to date</li>
								<li>
									Respond to inquiries from students who have unlocked listings
								</li>
								<li>
									Mark listings as &quot;taken&quot; when no longer available
								</li>
								<li>Not engage in any fraudulent or deceptive practices</li>
							</ul>
							<p>
								Violation of these obligations may result in account suspension
								and forfeiture of earnings.
							</p>
						</CardContent>
					</Card>

					{/* Prohibited Activities */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Ban className='h-5 w-5' />
								Prohibited Activities
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>Users are prohibited from:</p>
							<ul>
								<li>Creating fake listings or providing false information</li>
								<li>Sharing unlocked information with non-paying users</li>
								<li>Harassing, threatening, or abusing other users</li>
								<li>Attempting to circumvent payment systems</li>
								<li>
									Using automated systems to scrape data from the platform
								</li>
								<li>Posting inappropriate content or photos</li>
								<li>Impersonating other users or agents</li>
								<li>Engaging in any illegal activities</li>
							</ul>
						</CardContent>
					</Card>

					{/* Content Rights */}
					<Card>
						<CardHeader>
							<CardTitle>Content & Intellectual Property</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<h4>Your Content</h4>
							<p>
								By uploading content (photos, descriptions, etc.) to the
								Platform, you grant us a non-exclusive, worldwide license to
								use, display, and distribute that content for the purpose of
								operating the Platform.
							</p>

							<h4>Platform Content</h4>
							<p>
								The Platform and its original content, features, and
								functionality are owned by EasyVille Estates and are protected
								by intellectual property laws.
							</p>
						</CardContent>
					</Card>

					{/* Disclaimers */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<AlertTriangle className='h-5 w-5' />
								Disclaimers & Limitations
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<h4>No Guarantee</h4>
							<p>
								We do not guarantee the accuracy of listing information provided
								by agents and owners. Users should verify property details
								before making decisions.
							</p>

							<h4>Limitation of Liability</h4>
							<p>
								EasyVille Estates shall not be liable for any indirect,
								incidental, special, consequential, or punitive damages arising
								from your use of the Platform.
							</p>

							<h4>Third-Party Transactions</h4>
							<p>
								Any agreements made between students and agents/owners regarding
								rentals are between those parties only. We are not responsible
								for disputes arising from such transactions.
							</p>
						</CardContent>
					</Card>

					{/* Dispute Resolution */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Scale className='h-5 w-5' />
								Dispute Resolution
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>In case of disputes between users or with the Platform:</p>
							<ul>
								<li>
									First, contact our support team at
									support@easyvilleestates.com
								</li>
								<li>
									We will investigate and attempt to resolve the issue within 14
									days
								</li>
								<li>If unresolved, disputes may be submitted to arbitration</li>
								<li>Nigerian law governs these terms and any disputes</li>
							</ul>
						</CardContent>
					</Card>

					{/* Termination */}
					<Card>
						<CardHeader>
							<CardTitle>Account Termination</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>
								We reserve the right to suspend or terminate accounts that
								violate these terms. Users may also delete their accounts at any
								time.
							</p>
							<p>
								Upon termination, users lose access to the Platform and any
								unlocked listings. Agent earnings will be settled according to
								our payment schedule.
							</p>
						</CardContent>
					</Card>

					{/* Contact */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<HelpCircle className='h-5 w-5' />
								Contact & Questions
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>
								If you have questions about these Terms of Service, please
								contact us:
							</p>
							<ul>
								<li>Email: legal@easyvilleestates.com</li>
								<li>Phone: +234 801 234 5678</li>
							</ul>
							<p className='text-muted-foreground mt-4'>
								We may update these terms at any time. Continued use of the
								Platform constitutes acceptance of any changes.
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
