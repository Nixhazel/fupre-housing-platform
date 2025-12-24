'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { toast } from 'sonner';
import { requestPasswordReset, resendResetEmail } from '@/lib/auth/mockReset';

// Validation schema
const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Resend cooldown in seconds
const RESEND_COOLDOWN = 60;

export default function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState('');
	const [resendCooldown, setResendCooldown] = useState(0);
	const [isResending, setIsResending] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema)
	});

	// Countdown timer for resend button
	useEffect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [resendCooldown]);

	const onSubmit = async (data: ForgotPasswordFormData) => {
		setIsLoading(true);
		try {
			await requestPasswordReset(data.email);
			setSubmittedEmail(data.email);
			setIsSubmitted(true);
			setResendCooldown(RESEND_COOLDOWN);
		} catch {
			toast.error('Something went wrong. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = useCallback(async () => {
		if (resendCooldown > 0 || isResending) return;

		setIsResending(true);
		try {
			await resendResetEmail(submittedEmail);
			toast.success('Reset link resent successfully');
			setResendCooldown(RESEND_COOLDOWN);
		} catch {
			toast.error('Failed to resend. Please try again.');
		} finally {
			setIsResending(false);
		}
	}, [resendCooldown, isResending, submittedEmail]);

	// Success state - Check your email
	if (isSubmitted) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className='w-full max-w-md'>
					<Card>
						<CardHeader className='text-center'>
							<div className='flex justify-center mb-4'>
								<div className='p-3 rounded-full bg-green-100 dark:bg-green-900/30'>
									<Mail className='h-8 w-8 text-green-600 dark:text-green-400' />
								</div>
							</div>
							<CardTitle className='text-2xl'>Check Your Email</CardTitle>
							<CardDescription className='mt-2'>
								We sent a password reset link to
							</CardDescription>
							<p className='font-medium text-foreground mt-1'>{submittedEmail}</p>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='p-4 bg-muted rounded-lg'>
								<h4 className='text-sm font-semibold mb-2'>Next steps:</h4>
								<ol className='space-y-2 text-sm text-muted-foreground list-decimal list-inside'>
									<li>Check your email inbox (and spam folder)</li>
									<li>Click the reset link in the email</li>
									<li>Create a new password</li>
								</ol>
							</div>

							<div className='space-y-3'>
								<Button
									variant='outline'
									className='w-full'
									disabled={resendCooldown > 0 || isResending}
									onClick={handleResend}>
									{isResending ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Resending...
										</>
									) : resendCooldown > 0 ? (
										`Resend link in ${resendCooldown}s`
									) : (
										'Resend reset link'
									)}
								</Button>

								<Button variant='ghost' className='w-full' asChild>
									<Link href='/auth/login'>
										<ArrowLeft className='mr-2 h-4 w-4' />
										Back to login
									</Link>
								</Button>
							</div>

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

	// Initial state - Request form
	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className='w-full max-w-md'>
				<Card>
					<CardHeader className='text-center'>
						<div className='flex justify-center mb-4'>
							<div className='p-3 rounded-full bg-primary/10'>
								<Building2 className='h-8 w-8 text-primary' />
							</div>
						</div>
						<CardTitle className='text-2xl'>Forgot Password?</CardTitle>
						<CardDescription>
							No worries! Enter your email and we&apos;ll send you a reset link.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='email'>Email Address</Label>
								<Input
									id='email'
									type='email'
									placeholder='Enter your email'
									autoComplete='email'
									autoFocus
									{...register('email')}
									className={errors.email ? 'border-red-500' : ''}
								/>
								{errors.email && (
									<p className='text-sm text-red-500'>{errors.email.message}</p>
								)}
							</div>

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Sending reset link...
									</>
								) : (
									'Send Reset Link'
								)}
							</Button>
						</form>

						<div className='mt-6 text-center'>
							<Link
								href='/auth/login'
								className='inline-flex items-center text-sm text-muted-foreground hover:text-primary'>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Back to login
							</Link>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

