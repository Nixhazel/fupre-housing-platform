/**
 * Email Service
 *
 * Centralized email sending with beautiful templates
 *
 * Usage:
 * ```ts
 * import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email';
 *
 * await sendPasswordResetEmail('user@example.com', {
 *   name: 'John Doe',
 *   resetUrl: 'https://example.com/reset?token=xxx'
 * });
 * ```
 */

// Main send functions
export {
	sendPasswordResetEmail,
	sendPasswordResetConfirmationEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
	sendPaymentApprovedEmail,
	sendPaymentRejectedEmail,
	type SendEmailResult,
	type PasswordResetEmailProps,
	type EmailVerificationProps
} from './send';

// Transporter utilities
export {
	getTransporter,
	verifyEmailConnection,
	closeTransporter,
	isEmailConfigured
} from './transporter';

// Templates (for customization or testing)
export {
	baseTemplate,
	emailButton,
	emailInfoBox,
	type BaseTemplateProps
} from './templates/base';

export {
	passwordResetEmail,
	passwordResetEmailText,
	passwordResetConfirmationEmail
} from './templates/password-reset';

export {
	emailVerificationEmail,
	emailVerificationEmailText,
	welcomeEmail
} from './templates/email-verification';

