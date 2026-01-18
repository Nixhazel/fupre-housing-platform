'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
						<Shield className='h-8 w-8' />
					</div>
					<h1 className='text-4xl font-bold mb-4'>Privacy Policy</h1>
					<p className='text-muted-foreground'>
						Last updated: January 2025
					</p>
				</motion.div>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='space-y-8'>
					{/* Introduction */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Eye className='h-5 w-5' />
								Introduction
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>
								EasyVille Estates (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
								This Privacy Policy explains how we collect, use, disclose, and safeguard your 
								information when you use our student housing platform.
							</p>
							<p>
								By using our services, you agree to the collection and use of information in 
								accordance with this policy.
							</p>
						</CardContent>
					</Card>

					{/* Information We Collect */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Database className='h-5 w-5' />
								Information We Collect
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<h4>Personal Information</h4>
							<ul>
								<li>Name and email address when you create an account</li>
								<li>Phone number (optional, for agent contact)</li>
								<li>Profile information you choose to provide</li>
							</ul>

							<h4>Usage Information</h4>
							<ul>
								<li>Listings you view and save</li>
								<li>Roommate preferences you set</li>
								<li>Payment proof images for listing unlocks</li>
								<li>Device and browser information</li>
							</ul>

							<h4>Agent/Owner Information</h4>
							<ul>
								<li>Property listing details</li>
								<li>Bank account information for earnings (encrypted)</li>
								<li>Verification documents</li>
							</ul>
						</CardContent>
					</Card>

					{/* How We Use Your Information */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<UserCheck className='h-5 w-5' />
								How We Use Your Information
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>We use the information we collect to:</p>
							<ul>
								<li>Provide and maintain our services</li>
								<li>Process payments and unlock listings</li>
								<li>Connect students with verified agents</li>
								<li>Facilitate roommate matching</li>
								<li>Send important notifications about your account</li>
								<li>Improve our platform based on usage patterns</li>
								<li>Prevent fraud and ensure platform security</li>
								<li>Comply with legal obligations</li>
							</ul>
						</CardContent>
					</Card>

					{/* Data Protection */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Lock className='h-5 w-5' />
								Data Protection & Security
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>We implement robust security measures to protect your data:</p>
							<ul>
								<li>All data is encrypted in transit using HTTPS/TLS</li>
								<li>Passwords are hashed using industry-standard algorithms</li>
								<li>Payment information is processed securely</li>
								<li>Access to personal data is restricted to authorized personnel</li>
								<li>Regular security audits and updates</li>
							</ul>
							<p>
								While we strive to protect your information, no method of electronic 
								storage is 100% secure. We cannot guarantee absolute security.
							</p>
						</CardContent>
					</Card>

					{/* Data Sharing */}
					<Card>
						<CardHeader>
							<CardTitle>Information Sharing</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>We may share your information in the following situations:</p>
							<ul>
								<li>
									<strong>With Agents:</strong> When you unlock a listing, your contact 
									information may be shared with the property agent.
								</li>
								<li>
									<strong>With Roommates:</strong> When you create a roommate listing, 
									your profile information is visible to other users.
								</li>
								<li>
									<strong>Service Providers:</strong> We may share data with third-party 
									services that help us operate (e.g., Cloudinary for images).
								</li>
								<li>
									<strong>Legal Requirements:</strong> We may disclose information if 
									required by law or to protect our rights.
								</li>
							</ul>
							<p>We do not sell your personal information to third parties.</p>
						</CardContent>
					</Card>

					{/* Your Rights */}
					<Card>
						<CardHeader>
							<CardTitle>Your Rights</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>You have the right to:</p>
							<ul>
								<li>Access your personal data</li>
								<li>Correct inaccurate information</li>
								<li>Delete your account and associated data</li>
								<li>Opt-out of marketing communications</li>
								<li>Request a copy of your data</li>
							</ul>
							<p>
								To exercise these rights, please contact us using the information below.
							</p>
						</CardContent>
					</Card>

					{/* Cookies */}
					<Card>
						<CardHeader>
							<CardTitle>Cookies & Local Storage</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>
								We use cookies and local storage to enhance your experience:
							</p>
							<ul>
								<li>
									<strong>Essential Cookies:</strong> Required for authentication and 
									basic functionality.
								</li>
								<li>
									<strong>Preference Cookies:</strong> Remember your settings like 
									theme preference.
								</li>
							</ul>
							<p>
								You can manage cookie preferences through your browser settings.
							</p>
						</CardContent>
					</Card>

					{/* Contact */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Mail className='h-5 w-5' />
								Contact Us
							</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>
								If you have any questions about this Privacy Policy, please contact us:
							</p>
							<ul>
								<li>Email: privacy@easyvilleestates.com</li>
								<li>Phone: +234 801 234 5678</li>
								<li>Address: Federal University of Petroleum Resources, Effurun, Delta State</li>
							</ul>
						</CardContent>
					</Card>

					{/* Updates */}
					<Card>
						<CardHeader>
							<CardTitle>Policy Updates</CardTitle>
						</CardHeader>
						<CardContent className='prose prose-sm dark:prose-invert max-w-none'>
							<p>
								We may update this Privacy Policy from time to time. We will notify you 
								of any changes by posting the new Privacy Policy on this page and updating 
								the &quot;Last updated&quot; date.
							</p>
							<p>
								Your continued use of our services after any changes constitutes your 
								acceptance of the updated policy.
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}

