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
	LISTINGS: 'easyville-estates/listings',
	LISTING_VIDEOS: 'easyville-estates/listing-videos',
	PAYMENT_PROOFS: 'easyville-estates/payment-proofs',
	ROOMMATES: 'easyville-estates/roommates',
	AVATARS: 'easyville-estates/avatars'
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
	IMAGE: 10 * 1024 * 1024, // 10MB
	VIDEO: 100 * 1024 * 1024, // 100MB
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
 * Allowed video types
 */
export const ALLOWED_VIDEO_TYPES = [
	'video/mp4',
	'video/webm',
	'video/quicktime', // .mov
	'video/x-msvideo' // .avi
] as const;

/**
 * Validate image file before upload
 */
export function validateImageFile(
	file: File,
	maxSize: number = MAX_FILE_SIZES.IMAGE
): { valid: boolean; error?: string } {
	// Check file type
	if (
		!ALLOWED_IMAGE_TYPES.includes(
			file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
		)
	) {
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
 * Validate video file before upload
 */
export function validateVideoFile(
	file: File,
	maxSize: number = MAX_FILE_SIZES.VIDEO
): { valid: boolean; error?: string } {
	// Check file type
	if (
		!ALLOWED_VIDEO_TYPES.includes(
			file.type as (typeof ALLOWED_VIDEO_TYPES)[number]
		)
	) {
		return {
			valid: false,
			error: 'Invalid file type. Please upload an MP4, WebM, MOV, or AVI video.'
		};
	}

	// Check file size
	if (file.size > maxSize) {
		const maxSizeMB = Math.round(maxSize / 1024 / 1024);
		return {
			valid: false,
			error: `Video is too large. Maximum size is ${maxSizeMB}MB.`
		};
	}

	return { valid: true };
}

/**
 * Check if file is a video
 */
export function isVideoFile(file: File): boolean {
	return ALLOWED_VIDEO_TYPES.includes(
		file.type as (typeof ALLOWED_VIDEO_TYPES)[number]
	);
}

/**
 * Build Cloudinary image URL with transformations
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

	const {
		width,
		height,
		crop = 'fill',
		quality = 'auto',
		format = 'auto'
	} = options;

	const transformations: string[] = [];

	if (width) transformations.push(`w_${width}`);
	if (height) transformations.push(`h_${height}`);
	if (crop) transformations.push(`c_${crop}`);
	if (quality) transformations.push(`q_${quality}`);
	if (format) transformations.push(`f_${format}`);

	const transformationString =
		transformations.length > 0 ? transformations.join(',') + '/' : '';

	return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformationString}${publicId}`;
}

/**
 * Build Cloudinary video URL with transformations
 */
export function buildCloudinaryVideoUrl(
	publicId: string,
	options: {
		width?: number;
		height?: number;
		crop?: 'fill' | 'fit' | 'scale';
		quality?: 'auto' | number;
		format?: 'auto' | 'mp4' | 'webm';
	} = {}
): string {
	const config = getCloudinaryConfig();

	if (!config.isConfigured) {
		return publicId; // Return original if not configured
	}

	const {
		width,
		height,
		crop = 'fill',
		quality = 'auto',
		format = 'auto'
	} = options;

	const transformations: string[] = [];

	if (width) transformations.push(`w_${width}`);
	if (height) transformations.push(`h_${height}`);
	if (crop) transformations.push(`c_${crop}`);
	if (quality) transformations.push(`q_${quality}`);
	if (format) transformations.push(`f_${format}`);

	const transformationString =
		transformations.length > 0 ? transformations.join(',') + '/' : '';

	return `https://res.cloudinary.com/${config.cloudName}/video/upload/${transformationString}${publicId}`;
}
