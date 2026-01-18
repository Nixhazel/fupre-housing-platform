/**
 * Password Reset Email Template
 */

import { baseTemplate, emailButton, emailInfoBox } from './base';

export interface PasswordResetEmailProps {
	name: string;
	resetUrl: string;
	expiresInMinutes?: number;
	ipAddress?: string;
}

/**
 * Generate password reset email HTML
 */
export function passwordResetEmail({
	name,
	resetUrl,
	expiresInMinutes = 60,
	ipAddress
}: PasswordResetEmailProps): string {
	const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Reset Your Password
</h2>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  Hi ${name},
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  We received a request to reset the password for your account. Click the button below to create a new password:
</p>

${emailButton('Reset Password', resetUrl)}

<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #71717a;">
  This link will expire in <strong>${expiresInMinutes} minutes</strong>.
</p>

${emailInfoBox(
	"If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.",
	'warning'
)}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
  If the button doesn't work, copy and paste this link into your browser:
</p>

<p style="margin: 8px 0 0; font-size: 12px; word-break: break-all; color: #3b82f6;">
  <a href="${resetUrl}" style="color: #3b82f6; text-decoration: none;">${resetUrl}</a>
</p>

${ipAddress ? `
<p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa;">
  This request was made from IP address: ${ipAddress}
</p>
` : ''}
`.trim();

	return baseTemplate({
		title: 'Reset Your Password',
		previewText: `Reset your password. This link expires in ${expiresInMinutes} minutes.`,
		content,
		footerText: "You're receiving this email because a password reset was requested for your account."
	});
}

/**
 * Generate password reset confirmation email HTML
 */
export function passwordResetConfirmationEmail({
	name
}: {
	name: string;
}): string {
	const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Password Successfully Changed
</h2>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  Hi ${name},
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  Your password has been successfully changed. You can now log in with your new password.
</p>

${emailInfoBox(
	"If you didn't make this change, please contact our support team immediately to secure your account.",
	'warning'
)}
`.trim();

	return baseTemplate({
		title: 'Password Changed Successfully',
		previewText: 'Your password has been successfully changed.',
		content,
		footerText: "You're receiving this email because your password was recently changed."
	});
}

/**
 * Generate plain text version for password reset
 */
export function passwordResetEmailText({
	name,
	resetUrl,
	expiresInMinutes = 60
}: PasswordResetEmailProps): string {
	return `
Reset Your Password

Hi ${name},

We received a request to reset the password for your account.

Click this link to create a new password:
${resetUrl}

This link will expire in ${expiresInMinutes} minutes.

If you didn't request a password reset, please ignore this email.

---
This email was sent by EasyVille Estates.
`.trim();
}

