/**
 * Email Verification Email Template
 */

import { baseTemplate, emailButton, emailInfoBox } from './base';

export interface EmailVerificationProps {
	name: string;
	verifyUrl: string;
	expiresInHours?: number;
}

/**
 * Generate email verification HTML
 */
export function emailVerificationEmail({
	name,
	verifyUrl,
	expiresInHours = 24
}: EmailVerificationProps): string {
	const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Verify Your Email Address
</h2>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  Hi ${name},
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  Welcome to EasyVille Estates! 🎉 Please verify your email address to complete your registration and access all features.
</p>

${emailButton('Verify Email Address', verifyUrl, '#22c55e')}

<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #71717a;">
  This link will expire in <strong>${expiresInHours} hours</strong>.
</p>

${emailInfoBox(
	"Once verified, you'll be able to save listings, submit payment proofs, and access exclusive features.",
	'info'
)}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
  If the button doesn't work, copy and paste this link into your browser:
</p>

<p style="margin: 8px 0 0; font-size: 12px; word-break: break-all; color: #3b82f6;">
  <a href="${verifyUrl}" style="color: #3b82f6; text-decoration: none;">${verifyUrl}</a>
</p>
`.trim();

	return baseTemplate({
		title: 'Verify Your Email',
		previewText: 'Welcome! Please verify your email to complete your registration.',
		content,
		footerText: "You're receiving this email because you recently created an account."
	});
}

/**
 * Generate welcome email after verification
 */
export function welcomeEmail({
	name
}: {
	name: string;
}): string {
	const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Welcome to EasyVille Estates! 🎉
</h2>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  Hi ${name},
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
  Your email has been verified and your account is now fully activated. You're all set to find your perfect student housing!
</p>

<h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #18181b;">
  What you can do now:
</h3>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: #22c55e; font-size: 18px;">✓</span>
      <span style="margin-left: 8px; color: #3f3f46;">Browse available listings near campus</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: #22c55e; font-size: 18px;">✓</span>
      <span style="margin-left: 8px; color: #3f3f46;">Save your favorite properties</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: #22c55e; font-size: 18px;">✓</span>
      <span style="margin-left: 8px; color: #3f3f46;">Unlock property locations and contact details</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: #22c55e; font-size: 18px;">✓</span>
      <span style="margin-left: 8px; color: #3f3f46;">Find compatible roommates</span>
    </td>
  </tr>
</table>

${emailButton('Start Browsing Listings', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/listings`)}

${emailInfoBox(
	"Need help? Visit our Help Center or contact our support team.",
	'info'
)}
`.trim();

	return baseTemplate({
		title: 'Welcome to EasyVille Estates',
		previewText: 'Your account is verified! Start finding your perfect student housing.',
		content,
		footerText: 'Happy house hunting!'
	});
}

/**
 * Generate plain text version for email verification
 */
export function emailVerificationEmailText({
	name,
	verifyUrl,
	expiresInHours = 24
}: EmailVerificationProps): string {
	return `
Verify Your Email Address

Hi ${name},

Welcome to EasyVille Estates!

Please verify your email address by clicking this link:
${verifyUrl}

This link will expire in ${expiresInHours} hours.

Once verified, you'll be able to save listings, submit payment proofs, and access exclusive features.

---
This email was sent by EasyVille Estates.
`.trim();
}

