/**
 * Cloudinary Configuration
 *
 * Provides configuration for both client-side and server-side usage
 */

import { env, logger, isDevelopment } from '@/lib/config/env';

/**
 * Get Cloudinary configuration
 */
export function getCloudinaryConfig() {
	const config = env.cloudinary;

	if (!config.cloudName || !config.uploadPreset) {
		if (isDevelopment) {
			logger.warn(
				'Cloudinary not fully configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
			);
		}
	}

	return {
		cloudName: config.cloudName,
		uploadPreset: config.uploadPreset,
		isConfigured: !!(config.cloudName && config.uploadPreset)
	};
}

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
	const config = env.cloudinary;
	return !!(config.cloudName && config.uploadPreset);
}

/**
 * Upload folders for different content types
 */
export const UPLOAD_FOLDERS = {
	LISTINGS: 'fupre-housing/listings',
	PAYMENT_PROOFS: 'fupre-housing/payment-proofs',
	ROOMMATES: 'fupre-housing/roommates',
	AVATARS: 'fupre-housing/avatars'
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
	IMAGE: 10 * 1024 * 1024, // 10MB
	AVATAR: 5 * 1024 * 1024, // 5MB
	PAYMENT_PROOF: 5 * 1024 * 1024 // 5MB
} as const;

/**
 * Allowed image types
 */
export const ALLOWED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif'
] as const;

/**
 * Validate file before upload
 */
export function validateImageFile(
	file: File,
	maxSize: number = MAX_FILE_SIZES.IMAGE
): { valid: boolean; error?: string } {
	// Check file type
	if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
		return {
			valid: false,
			error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
		};
	}

	// Check file size
	if (file.size > maxSize) {
		const maxSizeMB = Math.round(maxSize / 1024 / 1024);
		return {
			valid: false,
			error: `File is too large. Maximum size is ${maxSizeMB}MB.`
		};
	}

	return { valid: true };
}

/**
 * Build Cloudinary URL with transformations
 */
export function buildCloudinaryUrl(
	publicId: string,
	options: {
		width?: number;
		height?: number;
		crop?: 'fill' | 'fit' | 'scale' | 'thumb';
		quality?: 'auto' | number;
		format?: 'auto' | 'webp' | 'jpg' | 'png';
	} = {}
): string {
	const config = getCloudinaryConfig();

	if (!config.isConfigured) {
		return publicId; // Return original if not configured
	}

	const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;

	const transformations: string[] = [];

	if (width) transformations.push(`w_${width}`);
	if (height) transformations.push(`h_${height}`);
	if (crop) transformations.push(`c_${crop}`);
	if (quality) transformations.push(`q_${quality}`);
	if (format) transformations.push(`f_${format}`);

	const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';

	return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformationString}${publicId}`;
}

