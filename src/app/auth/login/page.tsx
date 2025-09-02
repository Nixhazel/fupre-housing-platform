'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useAuthStore } from '@/lib/store/authSlice';
import { loginSchema, type LoginFormData } from '@/lib/validators/auth';
import { toast } from 'sonner';

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuthStore();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema)
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			const user = await login(data);
			toast.success('Login successful!');

			// Redirect based on user role
			if (user?.role === 'admin') {
				router.push('/dashboard/admin');
			} else if (user?.role === 'agent') {
				router.push('/dashboard/agent');
			} else {
				router.push('/');
			}
		} catch {
			toast.error('Invalid email or password');
		} finally {
			setIsLoading(false);
		}
	};

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
						<CardTitle className='text-2xl'>Welcome Back</CardTitle>
						<CardDescription>
							Sign in to your FUPRE Housing account
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

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? (
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
						<div className='mt-6 p-4 bg-muted rounded-lg'>
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
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
