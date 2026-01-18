/**
 * Environment Variable Type Declarations
 *
 * This file provides TypeScript type safety for environment variables
 */

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Database
			MONGODB_URI: string;

			// Authentication
			JWT_SECRET: string;
			JWT_EXPIRES_IN?: string;

			// App URL
			NEXT_PUBLIC_APP_URL: string;

			// Email (Titan/GoDaddy)
			SMTP_HOST: string;
			SMTP_PORT: string;
			SMTP_USER: string;
			SMTP_PASS: string;
			SMTP_FROM_EMAIL: string;
			SMTP_FROM_NAME: string;

			// Cloudinary (for frontend upload)
			// Get from: https://cloudinary.com/console
			NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
			NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;

			// Optional: Cloudinary API credentials (for server-side operations)
			CLOUDINARY_API_KEY?: string;
			CLOUDINARY_API_SECRET?: string;

			// Environment
			NODE_ENV: 'development' | 'production' | 'test';
		}
	}
}

export {};
