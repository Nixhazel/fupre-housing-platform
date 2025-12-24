/**
 * Environment Configuration & Validation
 *
 * Centralized environment variable management with validation
 * Fail-fast approach: throws at startup if required vars are missing
 */

/**
 * Environment mode
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Required environment variables for different contexts
 */
const REQUIRED_SERVER_VARS = [
	'MONGODB_URI',
	'JWT_SECRET'
] as const;

const REQUIRED_PUBLIC_VARS = [
	'NEXT_PUBLIC_APP_URL'
] as const;

/**
 * Validated environment configuration
 * Lazily evaluated to avoid build-time errors
 */
class EnvConfig {
	private _validated = false;
	private _mongodbUri?: string;
	private _jwtSecret?: string;
	private _appUrl?: string;

	/**
	 * Validate all required environment variables
	 * Call this at application startup (not at import time)
	 */
	validate(): void {
		if (this._validated) return;

		const missing: string[] = [];

		// Check server-side variables
		for (const varName of REQUIRED_SERVER_VARS) {
			if (!process.env[varName]) {
				missing.push(varName);
			}
		}

		// Check public variables
		for (const varName of REQUIRED_PUBLIC_VARS) {
			if (!process.env[varName]) {
				// Warn but don't fail for public vars - they have defaults
				if (isDevelopment) {
					console.warn(`⚠️ Missing optional env var: ${varName}`);
				}
			}
		}

		if (missing.length > 0) {
			throw new Error(
				`Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\n` +
				'Please check your .env.local file or deployment configuration.'
			);
		}

		// Validate JWT_SECRET strength in production
		const jwtSecret = process.env.JWT_SECRET!;
		if (isProduction && jwtSecret.length < 32) {
			throw new Error(
				'JWT_SECRET must be at least 32 characters in production'
			);
		}

		// Cache validated values
		this._mongodbUri = process.env.MONGODB_URI;
		this._jwtSecret = process.env.JWT_SECRET;
		this._appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		this._validated = true;
	}

	/**
	 * Get MongoDB URI
	 */
	get mongodbUri(): string {
		if (!this._mongodbUri) {
			this._mongodbUri = process.env.MONGODB_URI;
			if (!this._mongodbUri) {
				throw new Error('MONGODB_URI is not configured');
			}
		}
		return this._mongodbUri;
	}

	/**
	 * Get JWT Secret
	 */
	get jwtSecret(): string {
		if (!this._jwtSecret) {
			this._jwtSecret = process.env.JWT_SECRET;
			if (!this._jwtSecret) {
				throw new Error('JWT_SECRET is not configured');
			}
		}
		return this._jwtSecret;
	}

	/**
	 * Get App URL
	 */
	get appUrl(): string {
		if (!this._appUrl) {
			this._appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		}
		return this._appUrl;
	}

	/**
	 * Get SMTP configuration
	 */
	get smtp() {
		return {
			host: process.env.SMTP_HOST || 'smtp.titan.email',
			port: parseInt(process.env.SMTP_PORT || '587', 10),
			user: process.env.SMTP_USER || '',
			pass: process.env.SMTP_PASS || '',
			fromEmail: process.env.SMTP_FROM_EMAIL || 'info@easyvilleestates.com',
			fromName: process.env.SMTP_FROM_NAME || 'Easyville Estates'
		};
	}

	/**
	 * Get Cloudinary configuration
	 */
	get cloudinary() {
		return {
			cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
			uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
		};
	}
}

// Singleton instance
export const env = new EnvConfig();

/**
 * Safe logger that respects production mode
 * Removes sensitive data and limits output in production
 */
export const logger = {
	info: (message: string, data?: unknown) => {
		if (!isProduction) {
			console.log(`ℹ️ ${message}`, data ?? '');
		}
	},
	warn: (message: string, data?: unknown) => {
		console.warn(`⚠️ ${message}`, data ?? '');
	},
	error: (message: string, error?: unknown) => {
		if (isProduction) {
			// In production, log minimal info
			console.error(`❌ ${message}`);
		} else {
			// In development, log full error
			console.error(`❌ ${message}`, error);
		}
	},
	debug: (message: string, data?: unknown) => {
		if (isDevelopment) {
			console.log(`🔍 ${message}`, data ?? '');
		}
	}
};

