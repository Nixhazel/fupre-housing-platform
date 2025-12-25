'use client';

/**
 * Email Verification Pending Page
 *
 * Shown after registration to prompt user to check their email
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useCurrentUser, useResendVerification } from '@/hooks/api/useAuth';

// Resend cooldown in seconds
const RESEND_COOLDOWN = 60;

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const emailFromQuery = searchParams.get('email');

	const { data: user, isLoading: isUserLoading, refetch } = useCurrentUser();
	const resendMutation = useResendVerification();

	const [cooldown, setCooldown] = useState(0);
	const [isChecking, setIsChecking] = useState(false);

	const email = user?.email || emailFromQuery || '';

	// Countdown timer
	useEffect(() => {
		if (cooldown > 0) {
			const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [cooldown]);

	// Redirect if already verified
	useEffect(() => {
		if (user?.isEmailVerified) {
			toast.success('Email verified! Welcome to EasyVille Estates.');
			router.push('/');
		}
	}, [user?.isEmailVerified, router]);

	const handleResend = useCallback(() => {
		if (cooldown > 0 || resendMutation.isPending || !email) return;

		resendMutation.mutate(email, {
			onSuccess: () => {
				setCooldown(RESEND_COOLDOWN);
				toast.success('Verification email sent!');
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to resend email');
			}
		});
	}, [cooldown, resendMutation, email]);

	const handleCheckStatus = useCallback(async () => {
		setIsChecking(true);
		try {
			const result = await refetch();
			if (result.data?.isEmailVerified) {
				toast.success('Email verified!');
				router.push('/');
			} else {
				toast.info('Email not yet verified. Please check your inbox.');
			}
		} finally {
			setIsChecking(false);
		}
	}, [refetch, router]);

	if (isUserLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-secondary/10'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-secondary/10 p-4'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className='w-full max-w-md'>
				<Card>
					<CardHeader className='text-center'>
						<div className='flex justify-center mb-4'>
							<div className='p-4 rounded-full bg-primary/10'>
								<Mail className='h-10 w-10 text-primary' />
							</div>
						</div>
						<CardTitle className='text-2xl'>Check Your Email</CardTitle>
						<CardDescription className='mt-2'>
							We sent a verification link to
						</CardDescription>
						{email && (
							<p className='font-medium text-foreground mt-1'>{email}</p>
						)}
					</CardHeader>

					<CardContent className='space-y-6'>
						{/* Instructions */}
						<div className='p-4 bg-muted rounded-lg'>
							<h4 className='text-sm font-semibold mb-3'>Next steps:</h4>
							<ol className='space-y-2 text-sm text-muted-foreground'>
								<li className='flex items-start gap-2'>
									<span className='font-medium text-primary'>1.</span>
									Check your email inbox (and spam folder)
								</li>
								<li className='flex items-start gap-2'>
									<span className='font-medium text-primary'>2.</span>
									Click the verification link
								</li>
								<li className='flex items-start gap-2'>
									<span className='font-medium text-primary'>3.</span>
									Start browsing listings!
								</li>
							</ol>
						</div>

						{/* Actions */}
						<div className='space-y-3'>
							{/* Check verification status */}
							<Button
								variant='default'
								className='w-full'
								onClick={handleCheckStatus}
								disabled={isChecking}>
								{isChecking ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Checking...
									</>
								) : (
									<>
										<RefreshCw className='mr-2 h-4 w-4' />
										I&apos;ve verified my email
									</>
								)}
							</Button>

							{/* Resend email */}
							<Button
								variant='outline'
								className='w-full'
								onClick={handleResend}
								disabled={cooldown > 0 || resendMutation.isPending}>
								{resendMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Sending...
									</>
								) : cooldown > 0 ? (
									`Resend email in ${cooldown}s`
								) : (
									<>
										<Mail className='mr-2 h-4 w-4' />
										Resend verification email
									</>
								)}
							</Button>

							{/* Continue without verifying */}
							<Button variant='ghost' className='w-full' asChild>
								<Link href='/'>
									Continue to browse
									<ArrowRight className='ml-2 h-4 w-4' />
								</Link>
							</Button>
						</div>

						{/* Note */}
						<p className='text-xs text-center text-muted-foreground'>
							Didn&apos;t receive the email? Check your spam folder or try a
							different email address.
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-secondary/10'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			}>
			<VerifyEmailContent />
		</Suspense>
	);
}
