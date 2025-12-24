/**
 * Cloudinary Image Upload Service
 *
 * Provides utilities for uploading and managing images on Cloudinary
 *
 * Usage:
 * ```tsx
 * import { uploadImage, UPLOAD_FOLDERS } from '@/lib/cloudinary';
 *
 * const result = await uploadImage(file, {
 *   folder: UPLOAD_FOLDERS.LISTINGS,
 *   tags: ['listing', 'property']
 * });
 *
 * if (result.success) {
 *   console.log('Uploaded:', result.url);
 * }
 * ```
 */

// Configuration
export {
	getCloudinaryConfig,
	isCloudinaryConfigured,
	UPLOAD_FOLDERS,
	MAX_FILE_SIZES,
	ALLOWED_IMAGE_TYPES,
	validateImageFile,
	buildCloudinaryUrl,
	type UploadFolder
} from './config';

// Upload utilities
export {
	uploadImage,
	uploadImages,
	uploadBase64Image,
	fileToBase64,
	getImageDimensions,
	type CloudinaryUploadResult,
	type UploadOptions
} from './upload';

