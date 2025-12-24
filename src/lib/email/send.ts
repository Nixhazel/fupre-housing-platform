/**
 * Email Sending Service
 *
 * Main interface for sending emails with templates
 */

import { getTransporter, isEmailConfigured } from './transporter';
import { env, logger, isDevelopment } from '@/lib/config/env';
import {
	passwordResetEmail,
	passwordResetEmailText,
	passwordResetConfirmationEmail,
	type PasswordResetEmailProps
} from './templates/password-reset';
import {
	emailVerificationEmail,
	emailVerificationEmailText,
	welcomeEmail,
	type EmailVerificationProps
} from './templates/email-verification';

/**
 * Email send result
 */
export interface SendEmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * Base email options
 */
interface BaseEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
	replyTo?: string;
}

/**
 * Send an email with HTML and optional text content
 */
async function sendEmail(options: BaseEmailOptions): Promise<SendEmailResult> {
	const { to, subject, html, text, replyTo } = options;
	const smtpConfig = env.smtp;

	// Check if email is configured
	if (!isEmailConfigured()) {
		if (isDevelopment) {
			logger.warn('Email not configured - logging email instead of sending');
			console.log('\n📧 ===== EMAIL (Development Mode) =====');
			console.log(`To: ${to}`);
			console.log(`Subject: ${subject}`);
			console.log(`Reply-To: ${replyTo || 'N/A'}`);
			console.log('=======================================\n');
			return { success: true, messageId: 'dev-mode-no-send' };
		}
		return { success: false, error: 'Email service not configured' };
	}

	try {
		const transporter = getTransporter();

		const mailOptions = {
			from: {
				name: smtpConfig.fromName,
				address: smtpConfig.fromEmail
			},
			to,
			subject,
			html,
			text: text || undefined,
			replyTo: replyTo || smtpConfig.fromEmail
		};

		const result = await transporter.sendMail(mailOptions);

		logger.info(`Email sent successfully to ${to}`, {
			messageId: result.messageId,
			subject
		});

		return {
			success: true,
			messageId: result.messageId
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		logger.error(`Failed to send email to ${to}`, error);

		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
	to: string,
	props: PasswordResetEmailProps
): Promise<SendEmailResult> {
	const html = passwordResetEmail(props);
	const text = passwordResetEmailText(props);

	return sendEmail({
		to,
		subject: 'Reset Your Password - FUPRE Housing Platform',
		html,
		text
	});
}

/**
 * Send password reset confirmation email
 */
export async function sendPasswordResetConfirmationEmail(
	to: string,
	name: string
): Promise<SendEmailResult> {
	const html = passwordResetConfirmationEmail({ name });

	return sendEmail({
		to,
		subject: 'Password Changed Successfully - FUPRE Housing Platform',
		html
	});
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
	to: string,
	props: EmailVerificationProps
): Promise<SendEmailResult> {
	const html = emailVerificationEmail(props);
	const text = emailVerificationEmailText(props);

	return sendEmail({
		to,
		subject: 'Verify Your Email - FUPRE Housing Platform',
		html,
		text
	});
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
	to: string,
	name: string
): Promise<SendEmailResult> {
	const html = welcomeEmail({ name });

	return sendEmail({
		to,
		subject: 'Welcome to FUPRE Housing Platform! 🏠',
		html
	});
}

/**
 * Send payment proof approved email
 */
export async function sendPaymentApprovedEmail(
	to: string,
	props: {
		name: string;
		listingTitle: string;
		listingUrl: string;
	}
): Promise<SendEmailResult> {
	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Approved</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #22c55e; margin: 0 0 20px;">✅ Payment Approved!</h1>
    <p style="color: #3f3f46; line-height: 1.6;">Hi ${props.name},</p>
    <p style="color: #3f3f46; line-height: 1.6;">
      Great news! Your payment proof for <strong>${props.listingTitle}</strong> has been approved.
    </p>
    <p style="color: #3f3f46; line-height: 1.6;">
      You now have full access to the property location and contact details.
    </p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${props.listingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        View Listing Details
      </a>
    </p>
    <p style="color: #71717a; font-size: 14px;">
      Thank you for using FUPRE Housing Platform!
    </p>
  </div>
</body>
</html>
`.trim();

	return sendEmail({
		to,
		subject: `Payment Approved: ${props.listingTitle}`,
		html
	});
}

/**
 * Send payment proof rejected email
 */
export async function sendPaymentRejectedEmail(
	to: string,
	props: {
		name: string;
		listingTitle: string;
		reason?: string;
		listingUrl: string;
	}
): Promise<SendEmailResult> {
	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Proof Rejected</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #ef4444; margin: 0 0 20px;">❌ Payment Proof Rejected</h1>
    <p style="color: #3f3f46; line-height: 1.6;">Hi ${props.name},</p>
    <p style="color: #3f3f46; line-height: 1.6;">
      Unfortunately, your payment proof for <strong>${props.listingTitle}</strong> could not be verified.
    </p>
    ${props.reason ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${props.reason}</p>
    </div>
    ` : ''}
    <p style="color: #3f3f46; line-height: 1.6;">
      Please submit a new payment proof with a clear image of your payment receipt.
    </p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${props.listingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Try Again
      </a>
    </p>
    <p style="color: #71717a; font-size: 14px;">
      If you believe this was a mistake, please contact our support team.
    </p>
  </div>
</body>
</html>
`.trim();

	return sendEmail({
		to,
		subject: `Payment Proof Rejected: ${props.listingTitle}`,
		html
	});
}

// Re-export types
export type { PasswordResetEmailProps, EmailVerificationProps };

