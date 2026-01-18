import { z } from 'zod';

/**
 * Server-side Auth Validators
 *
 * These are used by API routes for request validation
 */

/**
 * Registration schema
 */
export const registerSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
		.transform((v) => v.toLowerCase().trim()),

	password: z
		.string()
		.min(6, 'Password must be at least 6 characters')
		.max(100, 'Password cannot exceed 100 characters'),

	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name cannot exceed 50 characters')
		.transform((v) => v.trim()),

	phone: z
		.string()
		.regex(/^\+234\d{10}$/, 'Please enter a valid Nigerian phone number (+234...)')
		.optional(),

	role: z.enum(['student', 'agent', 'owner'], {
		message: 'Role must be student, agent, or owner'
	}),

	matricNumber: z
		.string()
		.max(20, 'Matric number cannot exceed 20 characters')
		.optional()
		.transform((v) => v?.trim())
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
		.transform((v) => v.toLowerCase().trim()),

	password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Email verification schema
 */
export const verifyEmailSchema = z.object({
	token: z.string().min(1, 'Verification token is required')
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
		.transform((v) => v.toLowerCase().trim())
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
	token: z.string().min(1, 'Reset token is required'),

	password: z
		.string()
		.min(6, 'Password must be at least 6 characters')
		.max(100, 'Password cannot exceed 100 characters')
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name cannot exceed 50 characters')
		.transform((v) => v.trim())
		.optional(),

	phone: z
		.string()
		.regex(/^\+234\d{10}$/, 'Please enter a valid Nigerian phone number')
		.optional()
		.nullable(),

	avatarUrl: z.string().url('Please enter a valid URL').optional().nullable(),

	matricNumber: z
		.string()
		.max(20, 'Matric number cannot exceed 20 characters')
		.optional()
		.nullable()
		.transform((v) => v?.trim())
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),

	newPassword: z
		.string()
		.min(6, 'New password must be at least 6 characters')
		.max(100, 'New password cannot exceed 100 characters')
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

