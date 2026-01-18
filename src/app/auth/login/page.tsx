'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
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
import { useLogin } from '@/hooks/api/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validators/auth';
import { toast } from 'sonner';

function LoginContent() {
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const loginMutation = useLogin();

	// Check for verification status from URL
	const verified = searchParams.get('verified');
	const error = searchParams.get('error');

	// Show toast messages based on URL params
	useEffect(() => {
		if (verified === 'true') {
			toast.success('Email verified successfully! You can now log in.', {
				id: 'email-verified',
				duration: 5000
			});
		} else if (error === 'invalid_token') {
			toast.error('Invalid or expired verification link.', {
				id: 'invalid-token',
				duration: 5000
			});
		} else if (error === 'verification_failed') {
			toast.error('Email verification failed. Please try again.', {
				id: 'verification-failed',
				duration: 5000
			});
		} else if (error === 'missing_token') {
			toast.error('Verification token is missing.', {
				id: 'missing-token',
				duration: 5000
			});
		}
	}, [verified, error]);

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema)
	});

	const onSubmit = async (data: LoginFormData) => {
		loginMutation.mutate(data, {
			onSuccess: (response) => {
				toast.success('Login successful!');

				// Redirect based on user role
				if (response.user?.role === 'admin') {
					router.push('/dashboard/admin');
				} else if (response.user?.role === 'agent') {
					router.push('/dashboard/agent');
				} else {
					router.push('/');
				}
			},
			onError: (error) => {
				toast.error(error.message || 'Invalid email or password');
			}
		});
	};

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
							<div className='p-3 rounded-full bg-primary/10'>
								<Building2 className='h-8 w-8 text-primary' />
							</div>
						</div>
						<CardTitle className='text-2xl'>Welcome Back</CardTitle>
					<CardDescription>
						Sign in to your EasyVille Estates account
					</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									placeholder='Enter your email'
									{...register('email')}
									className={errors.email ? 'border-red-500' : ''}
								/>
								{errors.email && (
									<p className='text-sm text-red-500'>{errors.email.message}</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<div className='relative'>
									<Input
										id='password'
										type={showPassword ? 'text' : 'password'}
										placeholder='Enter your password'
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

							<div className='flex justify-end'>
								<Link
									href='/auth/forgot-password'
									className='text-sm text-muted-foreground hover:text-primary'>
									Forgot password?
								</Link>
							</div>

							<Button
								type='submit'
								className='w-full'
								disabled={loginMutation.isPending}>
								{loginMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Signing in...
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>

						<div className='mt-6 text-center'>
							<p className='text-sm text-muted-foreground'>
								Don&apos;t have an account?{' '}
								<Link
									href='/auth/register'
									className='text-primary hover:underline'>
									Sign up
								</Link>
							</p>
						</div>

						{/* Demo Credentials */}
						{/* <div className='mt-6 p-4 bg-muted rounded-lg'>
							<h4 className='text-sm font-semibold mb-2'>Demo Credentials:</h4>
							<div className='space-y-1 text-xs text-muted-foreground'>
								<p>
									<strong>Student:</strong> john@fupre.edu.ng / password123
								</p>
								<p>
									<strong>Agent:</strong> sarah@fupre.edu.ng / password123
								</p>
								<p>
									<strong>Admin:</strong> admin@fupre.edu.ng / password123
								</p>
							</div>
						</div> */}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-secondary/10'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			}>
			<LoginContent />
		</Suspense>
	);
}
