/**
 * Mock Password Reset API
 *
 * Simulates backend behavior for password reset flow.
 * Replace with real API calls when backend is ready.
 */

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Request a password reset email
 *
 * Security note: Always returns success to prevent email enumeration
 *
 * @param email - User's email address
 * @returns Promise that resolves after "sending" email
 */
export async function requestPasswordReset(
	email: string
): Promise<{ success: boolean }> {
	// Simulate API call delay
	await delay(1500);

	// Log for development (will be removed in production)
	if (process.env.NODE_ENV === 'development') {
		console.log(`[Mock] Password reset requested for: ${email}`);
	}

	// Always return success (prevents email enumeration)
	return { success: true };
}

/**
 * Validate a password reset token
 *
 * @param token - Reset token from URL
 * @returns Promise with token validity
 */
export async function validateResetToken(
	token: string
): Promise<{ valid: boolean }> {
	await delay(500);

	// For demo purposes, any token starting with "valid" is valid
	// In production, this would verify against the database
	const isValid = token.length > 10 || token.startsWith('valid');

	return { valid: isValid };
}

/**
 * Reset password with token
 *
 * @param token - Reset token from URL
 * @param newPassword - New password to set
 * @returns Promise with reset result
 */
export async function resetPassword(
	token: string,
	newPassword: string
): Promise<{ success: boolean; error?: string }> {
	await delay(1500);

	// Validate token
	const { valid } = await validateResetToken(token);

	if (!valid) {
		return { success: false, error: 'Invalid or expired reset link' };
	}

	// Validate password strength
	if (newPassword.length < 6) {
		return { success: false, error: 'Password must be at least 6 characters' };
	}

	// Log for development
	if (process.env.NODE_ENV === 'development') {
		console.log(
			`[Mock] Password reset successful for token: ${token.substring(0, 10)}...`
		);
	}

	return { success: true };
}

/**
 * Resend password reset email
 *
 * @param email - User's email address
 * @returns Promise that resolves after "resending" email
 */
export async function resendResetEmail(
	email: string
): Promise<{ success: boolean }> {
	await delay(1000);

	if (process.env.NODE_ENV === 'development') {
		console.log(`[Mock] Password reset email resent to: ${email}`);
	}

	return { success: true };
}
