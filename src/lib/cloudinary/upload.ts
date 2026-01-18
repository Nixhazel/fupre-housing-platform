/**
 * Cloudinary Upload Utilities
 *
 * Client-side functions for uploading images to Cloudinary
 */

import {
	getCloudinaryConfig,
	validateImageFile,
	validateVideoFile,
	MAX_FILE_SIZES,
	type UploadFolder
} from './config';

/**
 * Upload result from Cloudinary
 */
export interface CloudinaryUploadResult {
	success: boolean;
	url?: string;
	publicId?: string;
	width?: number;
	height?: number;
	format?: string;
	bytes?: number;
	error?: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
	folder?: UploadFolder | string;
	maxSize?: number;
	tags?: string[];
	context?: Record<string, string>;
	onProgress?: (progress: number) => void;
}

/**
 * Cloudinary API response type
 */
interface CloudinaryResponse {
	secure_url: string;
	public_id: string;
	width: number;
	height: number;
	format: string;
	bytes: number;
	error?: { message: string };
}

/**
 * Upload a single image to Cloudinary
 *
 * Uses unsigned upload with upload preset
 */
export async function uploadImage(
	file: File,
	options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
	const config = getCloudinaryConfig();

	if (!config.isConfigured) {
		return {
			success: false,
			error: 'Cloudinary is not configured. Please set environment variables.'
		};
	}

	// Validate file
	const validation = validateImageFile(file, options.maxSize || MAX_FILE_SIZES.IMAGE);
	if (!validation.valid) {
		return {
			success: false,
			error: validation.error
		};
	}

	try {
		// Create form data
		const formData = new FormData();
		formData.append('file', file);
		formData.append('upload_preset', config.uploadPreset);

		if (options.folder) {
			formData.append('folder', options.folder);
		}

		if (options.tags && options.tags.length > 0) {
			formData.append('tags', options.tags.join(','));
		}

		if (options.context) {
			const contextString = Object.entries(options.context)
				.map(([key, value]) => `${key}=${value}`)
				.join('|');
			formData.append('context', contextString);
		}

		// Upload to Cloudinary
		const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

		const response = await fetch(uploadUrl, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Upload failed');
		}

		const data: CloudinaryResponse = await response.json();

		return {
			success: true,
			url: data.secure_url,
			publicId: data.public_id,
			width: data.width,
			height: data.height,
			format: data.format,
			bytes: data.bytes
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
		};
	}
}

/**
 * Upload multiple images to Cloudinary
 *
 * Returns array of results in same order as input files
 */
export async function uploadImages(
	files: File[],
	options: UploadOptions & {
		onFileProgress?: (index: number, progress: number) => void;
		onFileComplete?: (index: number, result: CloudinaryUploadResult) => void;
	} = {}
): Promise<CloudinaryUploadResult[]> {
	const results: CloudinaryUploadResult[] = [];

	for (let i = 0; i < files.length; i++) {
		const result = await uploadImage(files[i], {
			folder: options.folder,
			maxSize: options.maxSize,
			tags: options.tags,
			context: options.context
		});

		results.push(result);

		if (options.onFileComplete) {
			options.onFileComplete(i, result);
		}
	}

	return results;
}

/**
 * Upload image from data URL (Base64)
 */
export async function uploadBase64Image(
	base64Data: string,
	options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
	const config = getCloudinaryConfig();

	if (!config.isConfigured) {
		return {
			success: false,
			error: 'Cloudinary is not configured. Please set environment variables.'
		};
	}

	try {
		// Create form data with base64
		const formData = new FormData();
		formData.append('file', base64Data);
		formData.append('upload_preset', config.uploadPreset);

		if (options.folder) {
			formData.append('folder', options.folder);
		}

		if (options.tags && options.tags.length > 0) {
			formData.append('tags', options.tags.join(','));
		}

		// Upload to Cloudinary
		const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

		const response = await fetch(uploadUrl, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Upload failed');
		}

		const data: CloudinaryResponse = await response.json();

		return {
			success: true,
			url: data.secure_url,
			publicId: data.public_id,
			width: data.width,
			height: data.height,
			format: data.format,
			bytes: data.bytes
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
		};
	}
}

/**
 * Convert file to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
			URL.revokeObjectURL(img.src);
		};
		img.onerror = reject;
		img.src = URL.createObjectURL(file);
	});
}

/**
 * Video upload result from Cloudinary
 */
export interface CloudinaryVideoUploadResult {
	success: boolean;
	url?: string;
	publicId?: string;
	width?: number;
	height?: number;
	format?: string;
	duration?: number;
	bytes?: number;
	error?: string;
}

/**
 * Cloudinary video API response type
 */
interface CloudinaryVideoResponse {
	secure_url: string;
	public_id: string;
	width: number;
	height: number;
	format: string;
	duration: number;
	bytes: number;
	error?: { message: string };
}

/**
 * Upload a video to Cloudinary
 *
 * Uses unsigned upload with upload preset
 */
export async function uploadVideo(
	file: File,
	options: UploadOptions = {}
): Promise<CloudinaryVideoUploadResult> {
	const config = getCloudinaryConfig();

	if (!config.isConfigured) {
		return {
			success: false,
			error: 'Cloudinary is not configured. Please set environment variables.'
		};
	}

	// Validate file
	const validation = validateVideoFile(file, options.maxSize || MAX_FILE_SIZES.VIDEO);
	if (!validation.valid) {
		return {
			success: false,
			error: validation.error
		};
	}

	try {
		// Create form data
		const formData = new FormData();
		formData.append('file', file);
		formData.append('upload_preset', config.uploadPreset);
		formData.append('resource_type', 'video');

		if (options.folder) {
			formData.append('folder', options.folder);
		}

		if (options.tags && options.tags.length > 0) {
			formData.append('tags', options.tags.join(','));
		}

		if (options.context) {
			const contextString = Object.entries(options.context)
				.map(([key, value]) => `${key}=${value}`)
				.join('|');
			formData.append('context', contextString);
		}

		// Upload to Cloudinary video endpoint
		const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/video/upload`;

		const response = await fetch(uploadUrl, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Video upload failed');
		}

		const data: CloudinaryVideoResponse = await response.json();

		return {
			success: true,
			url: data.secure_url,
			publicId: data.public_id,
			width: data.width,
			height: data.height,
			format: data.format,
			duration: data.duration,
			bytes: data.bytes
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Video upload failed. Please try again.'
		};
	}
}

/**
 * Upload multiple videos to Cloudinary
 */
export async function uploadVideos(
	files: File[],
	options: UploadOptions & {
		onFileComplete?: (index: number, result: CloudinaryVideoUploadResult) => void;
	} = {}
): Promise<CloudinaryVideoUploadResult[]> {
	const results: CloudinaryVideoUploadResult[] = [];

	for (let i = 0; i < files.length; i++) {
		const result = await uploadVideo(files[i], {
			folder: options.folder,
			maxSize: options.maxSize,
			tags: options.tags,
			context: options.context
		});

		results.push(result);

		if (options.onFileComplete) {
			options.onFileComplete(i, result);
		}
	}

	return results;
}
