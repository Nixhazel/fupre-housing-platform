import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(1, 'Name is required')
			.min(2, 'Name must be at least 2 characters')
			.max(50, 'Name must be less than 50 characters'),
		email: z
			.string()
			.min(1, 'Email is required')
			.email('Please enter a valid email address'),
		phone: z
			.string()
			.min(1, 'Phone number is required')
			.regex(
				/^\+234\d{10}$/,
				'Please enter a valid Nigerian phone number (+234XXXXXXXXXX)'
			),
		role: z.enum(['student', 'agent', 'owner']),
		password: z
			.string()
			.min(1, 'Password is required')
			.min(6, 'Password must be at least 6 characters')
			.max(100, 'Password must be less than 100 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your password')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
