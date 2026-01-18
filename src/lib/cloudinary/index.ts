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
	ALLOWED_VIDEO_TYPES,
	validateImageFile,
	validateVideoFile,
	isVideoFile,
	buildCloudinaryUrl,
	buildCloudinaryVideoUrl,
	type UploadFolder
} from './config';

// Upload utilities
export {
	uploadImage,
	uploadImages,
	uploadBase64Image,
	uploadVideo,
	uploadVideos,
	fileToBase64,
	getImageDimensions,
	type CloudinaryUploadResult,
	type CloudinaryVideoUploadResult,
	type UploadOptions
} from './upload';

