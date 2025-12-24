/**
 * Nodemailer Transporter Configuration
 *
 * Creates and manages the email transport connection
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env, logger, isProduction } from '@/lib/config/env';

// Cached transporter instance
let transporter: Transporter | null = null;

/**
 * Get or create the email transporter
 * Uses singleton pattern to reuse connections
 */
export function getTransporter(): Transporter {
	if (transporter) {
		return transporter;
	}

	const smtpConfig = env.smtp;

	// Validate SMTP configuration
	if (!smtpConfig.user || !smtpConfig.pass) {
		logger.warn('SMTP credentials not configured. Emails will not be sent.');
	}

	transporter = nodemailer.createTransport({
		host: smtpConfig.host,
		port: smtpConfig.port,
		secure: smtpConfig.port === 465, // true for 465, false for other ports
		auth: {
			user: smtpConfig.user,
			pass: smtpConfig.pass
		},
		// Connection pool for better performance
		pool: true,
		maxConnections: 5,
		maxMessages: 100,
		// Timeouts
		connectionTimeout: 10000, // 10 seconds
		greetingTimeout: 10000,
		socketTimeout: 30000 // 30 seconds
	});

	return transporter;
}

/**
 * Verify SMTP connection is working
 * Call this at startup to catch configuration errors early
 */
export async function verifyEmailConnection(): Promise<boolean> {
	const smtpConfig = env.smtp;

	// Skip verification if SMTP is not configured
	if (!smtpConfig.user || !smtpConfig.pass) {
		logger.warn('SMTP not configured - email verification skipped');
		return false;
	}

	try {
		const transport = getTransporter();
		await transport.verify();
		logger.info('SMTP connection verified successfully');
		return true;
	} catch (error) {
		logger.error('SMTP connection verification failed', error);
		return false;
	}
}

/**
 * Close the transporter connection
 * Call this during graceful shutdown
 */
export function closeTransporter(): void {
	if (transporter) {
		transporter.close();
		transporter = null;
		logger.info('Email transporter closed');
	}
}

/**
 * Check if email is properly configured
 */
export function isEmailConfigured(): boolean {
	const smtpConfig = env.smtp;
	return !!(smtpConfig.user && smtpConfig.pass && smtpConfig.host);
}

