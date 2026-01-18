'use client';

/**
 * Email Verification Banner
 *
 * Shows a banner prompting unverified users to verify their email
 * Features:
 * - Dismissible (per session)
 * - Resend verification email button with cooldown
 * - Responsive design
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useResendVerification } from '@/hooks/api/useAuth';
import { toast } from 'sonner';

// Resend cooldown in seconds
const RESEND_COOLDOWN = 60;

export function EmailVerificationBanner() {
	const { data: user, isLoading } = useCurrentUser();
	const resendMutation = useResendVerification();

	const [isDismissed, setIsDismissed] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [justSent, setJustSent] = useState(false);

	// Countdown timer
	useEffect(() => {
		if (cooldown > 0) {
			const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [cooldown]);

	// Reset justSent state after a delay
	useEffect(() => {
		if (justSent) {
			const timer = setTimeout(() => setJustSent(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [justSent]);

	const handleResend = useCallback(() => {
		if (cooldown > 0 || resendMutation.isPending || !user?.email) return;

		resendMutation.mutate(user.email, {
			onSuccess: () => {
				setCooldown(RESEND_COOLDOWN);
				setJustSent(true);
				toast.success('Verification email sent! Check your inbox.');
			},
			onError: (error) => {
				if (error.message.includes('already verified')) {
					toast.info('Your email is already verified!');
					// Refresh user data
					window.location.reload();
				} else {
					toast.error(error.message || 'Failed to send verification email');
				}
			}
		});
	}, [cooldown, resendMutation, user?.email]);

	// Don't show if loading, dismissed, or user is verified
	if (isLoading || isDismissed || !user || user.isEmailVerified) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -50 }}
				className='bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800'>
				<div className='container mx-auto px-4 py-3'>
					<div className='flex items-center justify-between gap-4'>
						<div className='flex items-center gap-3 flex-1 min-w-0'>
							{justSent ? (
								<CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400 shrink-0' />
							) : (
								<AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0' />
							)}

							<div className='flex-1 min-w-0'>
								{justSent ? (
									<p className='text-sm text-green-800 dark:text-green-200'>
										Verification email sent to{' '}
										<span className='font-medium'>{user.email}</span>
									</p>
								) : (
									<p className='text-sm text-amber-800 dark:text-amber-200'>
										<span className='font-medium'>Verify your email</span>
										<span className='hidden sm:inline'>
											{' '}
											to access all features.
										</span>
										<span className='sm:hidden'> for full access.</span>
									</p>
								)}
							</div>
						</div>

						<div className='flex items-center gap-2 shrink-0'>
							<Button
								variant='outline'
								size='sm'
								onClick={handleResend}
								disabled={cooldown > 0 || resendMutation.isPending}
								className='bg-white dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/70'>
								{resendMutation.isPending ? (
									<>
										<Loader2 className='h-4 w-4 mr-2 animate-spin' />
										Sending...
									</>
								) : cooldown > 0 ? (
									<>
										<Mail className='h-4 w-4 mr-2' />
										{cooldown}s
									</>
								) : (
									<>
										<Mail className='h-4 w-4 mr-2' />
										<span className='hidden sm:inline'>Resend email</span>
										<span className='sm:hidden'>Resend</span>
									</>
								)}
							</Button>

							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsDismissed(true)}
								className='h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50'>
								<X className='h-4 w-4' />
								<span className='sr-only'>Dismiss</span>
							</Button>
						</div>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}

export default EmailVerificationBanner;
