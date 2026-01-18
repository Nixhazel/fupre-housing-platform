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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { useRegister } from '@/hooks/api/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validators/auth';
import { toast } from 'sonner';

export default function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();
	const registerMutation = useRegister();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors }
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema)
	});

	watch('role');

	const onSubmit = async (data: RegisterFormData) => {
		registerMutation.mutate(data, {
			onSuccess: (response) => {
				toast.success('Account created! Please verify your email.');
				// Redirect to verification page with email
				const email = response.user?.email || data.email;
				router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to create account. Please try again.');
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
						<CardTitle className='text-2xl'>Create Account</CardTitle>
						<CardDescription>Join EasyVille Estates today</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Full Name</Label>
								<Input
									id='name'
									type='text'
									placeholder='Enter your full name'
									{...register('name')}
									className={errors.name ? 'border-red-500' : ''}
								/>
								{errors.name && (
									<p className='text-sm text-red-500'>{errors.name.message}</p>
								)}
							</div>

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
								<Label htmlFor='phone'>Phone Number</Label>
								<Input
									id='phone'
									type='tel'
									placeholder='+234XXXXXXXXXX'
									{...register('phone')}
									className={errors.phone ? 'border-red-500' : ''}
								/>
								{errors.phone && (
									<p className='text-sm text-red-500'>{errors.phone.message}</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='role'>Account Type</Label>
								<Select
									onValueChange={(value) =>
										setValue(
											'role',
											value as 'student' | 'agent' | 'owner'
										)
									}>
									<SelectTrigger
										className={errors.role ? 'border-red-500' : ''}>
										<SelectValue placeholder='Select your role' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='student'>Student</SelectItem>
										<SelectItem value='agent'>Student Agent (ISA)</SelectItem>
										<SelectItem value='owner'>Property Owner</SelectItem>
									</SelectContent>
								</Select>
								{errors.role && (
									<p className='text-sm text-red-500'>{errors.role.message}</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<div className='relative'>
									<Input
										id='password'
										type={showPassword ? 'text' : 'password'}
										placeholder='Create a password'
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

							<div className='space-y-2'>
								<Label htmlFor='confirmPassword'>Confirm Password</Label>
								<div className='relative'>
									<Input
										id='confirmPassword'
										type={showConfirmPassword ? 'text' : 'password'}
										placeholder='Confirm your password'
										{...register('confirmPassword')}
										className={
											errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'
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

							<Button type='submit' className='w-full' disabled={registerMutation.isPending}>
								{registerMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating account...
									</>
								) : (
									'Create Account'
								)}
							</Button>
						</form>

						<div className='mt-6 text-center'>
							<p className='text-sm text-muted-foreground'>
								Already have an account?{' '}
								<Link
									href='/auth/login'
									className='text-primary hover:underline'>
									Sign in
								</Link>
							</p>
						</div>

						{/* Role Information */}
						<div className='mt-6 p-4 bg-muted rounded-lg'>
							<h4 className='text-sm font-semibold mb-2'>Account Types:</h4>
							<div className='space-y-1 text-xs text-muted-foreground'>
								<p>
									<strong>Student:</strong> Browse and book accommodations
								</p>
								<p>
									<strong>Student Agent (ISA):</strong> List properties and earn
									commissions
								</p>
								<p>
									<strong>Property Owner:</strong> Find roommates for your
									property
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
