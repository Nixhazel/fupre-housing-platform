'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Building2,
	Loader2,
	Eye,
	EyeOff,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	Check
} from 'lucide-react';
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
import { validateResetToken, resetPassword } from '@/lib/auth/mockReset';

// Password validation schema
const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(6, 'Password must be at least 6 characters')
			.max(100, 'Password is too long'),
		confirmPassword: z.string().min(1, 'Please confirm your password')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Password strength rules
const passwordRules = [
	{ label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
	{ label: 'Contains a number', test: (p: string) => /\d/.test(p) },
	{ label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
	{ label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) }
];

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') || '';

	const [isLoading, setIsLoading] = useState(false);
	const [isValidating, setIsValidating] = useState(true);
	const [isTokenValid, setIsTokenValid] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isValid }
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		mode: 'onChange'
	});

	const password = watch('password', '');

	// Validate token on mount
	useEffect(() => {
		async function checkToken() {
			if (!token) {
				setIsValidating(false);
				setIsTokenValid(false);
				return;
			}

			try {
				const result = await validateResetToken(token);
				setIsTokenValid(result.valid);
			} catch {
				setIsTokenValid(false);
			} finally {
				setIsValidating(false);
			}
		}

		checkToken();
	}, [token]);

	const onSubmit = async (data: ResetPasswordFormData) => {
		setIsLoading(true);
		try {
			const result = await resetPassword(token, data.password);

			if (result.success) {
				setIsSuccess(true);
				toast.success('Password reset successfully!');
			} else {
				toast.error(result.error || 'Failed to reset password');
			}
		} catch {
			toast.error('Something went wrong. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	// Loading state
	if (isValidating) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4'>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='text-center'>
					<Loader2 className='h-8 w-8 animate-spin text-primary mx-auto mb-4' />
					<p className='text-muted-foreground'>Validating your reset link...</p>
				</motion.div>
			</div>
		);
	}

	// Invalid token state
	if (!isTokenValid) {
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
								<div className='p-3 rounded-full bg-red-100 dark:bg-red-900/30'>
									<XCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
								</div>
							</div>
							<CardTitle className='text-2xl'>Invalid Reset Link</CardTitle>
							<CardDescription className='mt-2'>
								This password reset link is invalid or has expired.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='p-4 bg-muted rounded-lg'>
								<div className='flex items-start gap-3'>
									<AlertTriangle className='h-5 w-5 text-yellow-600 shrink-0 mt-0.5' />
									<div className='text-sm text-muted-foreground'>
										<p>Reset links expire after 1 hour for security.</p>
										<p className='mt-1'>Please request a new reset link.</p>
									</div>
								</div>
							</div>

							<Button className='w-full' asChild>
								<Link href='/auth/forgot-password'>Request New Reset Link</Link>
							</Button>

							<Button variant='ghost' className='w-full' asChild>
								<Link href='/auth/login'>Back to Login</Link>
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	// Success state
	if (isSuccess) {
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
									<CheckCircle2 className='h-8 w-8 text-green-600 dark:text-green-400' />
								</div>
							</div>
							<CardTitle className='text-2xl'>Password Reset!</CardTitle>
							<CardDescription className='mt-2'>
								Your password has been successfully reset.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<p className='text-center text-sm text-muted-foreground'>
								You can now sign in with your new password.
							</p>

							<Button
								className='w-full'
								onClick={() => router.push('/auth/login')}>
								Continue to Login
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	// Reset form state
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
						<CardTitle className='text-2xl'>Reset Your Password</CardTitle>
						<CardDescription>
							Enter a new password for your account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='password'>New Password</Label>
								<div className='relative'>
									<Input
										id='password'
										type={showPassword ? 'text' : 'password'}
										placeholder='Enter new password'
										autoComplete='new-password'
										autoFocus
										{...register('password')}
										className={
											errors.password ? 'border-red-500 pr-10' : 'pr-10'
										}
									/>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
										onClick={() => setShowPassword(!showPassword)}>
										{showPassword ? (
											<EyeOff className='h-4 w-4' />
										) : (
											<Eye className='h-4 w-4' />
										)}
									</Button>
								</div>
								{errors.password && (
									<p className='text-sm text-red-500'>
										{errors.password.message}
									</p>
								)}
							</div>

							{/* Password strength indicators */}
							{password.length > 0 && (
								<div className='space-y-2 p-3 bg-muted rounded-lg'>
									<p className='text-xs font-medium text-muted-foreground'>
										Password requirements:
									</p>
									<div className='grid gap-1.5'>
										{passwordRules.map((rule, index) => {
											const passed = rule.test(password);
											return (
												<div
													key={index}
													className={`flex items-center gap-2 text-xs ${
														passed
															? 'text-green-600 dark:text-green-400'
															: 'text-muted-foreground'
													}`}>
													{passed ? (
														<Check className='h-3 w-3' />
													) : (
														<div className='h-3 w-3 rounded-full border border-current' />
													)}
													{rule.label}
												</div>
											);
										})}
									</div>
								</div>
							)}

							<div className='space-y-2'>
								<Label htmlFor='confirmPassword'>Confirm Password</Label>
								<div className='relative'>
									<Input
										id='confirmPassword'
										type={showConfirmPassword ? 'text' : 'password'}
										placeholder='Confirm new password'
										autoComplete='new-password'
										{...register('confirmPassword')}
										className={
											errors.confirmPassword
												? 'border-red-500 pr-10'
												: 'pr-10'
										}
									/>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
										onClick={() =>
											setShowConfirmPassword(!showConfirmPassword)
										}>
										{showConfirmPassword ? (
											<EyeOff className='h-4 w-4' />
										) : (
											<Eye className='h-4 w-4' />
										)}
									</Button>
								</div>
								{errors.confirmPassword && (
									<p className='text-sm text-red-500'>
										{errors.confirmPassword.message}
									</p>
								)}
							</div>

							<Button
								type='submit'
								className='w-full'
								disabled={isLoading || !isValid}>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Resetting password...
									</>
								) : (
									'Reset Password'
								)}
							</Button>
						</form>

						<div className='mt-6 text-center'>
							<Link
								href='/auth/login'
								className='text-sm text-muted-foreground hover:text-primary'>
								Back to login
							</Link>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			}>
			<ResetPasswordContent />
		</Suspense>
	);
}

