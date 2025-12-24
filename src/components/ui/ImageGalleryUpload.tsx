'use client';

/**
 * ImageGalleryUpload Component
 *
 * A reusable multi-image upload component with Cloudinary integration
 * Features:
 * - Multiple image upload
 * - Drag and drop support
 * - Image reordering (drag to reorder)
 * - Cover image selection
 * - Upload progress per image
 * - Responsive grid layout
 */

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
	Upload,
	X,
	Loader2,
	AlertCircle,
	Plus,
	Star,
	GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	uploadImage,
	validateImageFile,
	MAX_FILE_SIZES,
	UPLOAD_FOLDERS,
	type UploadFolder
} from '@/lib/cloudinary';

export interface UploadedImage {
	id: string;
	url: string;
	uploading?: boolean;
	error?: string;
}

export interface ImageGalleryUploadProps {
	/** Current image URLs (for controlled component) */
	value?: string[];
	/** Called when images change */
	onChange?: (urls: string[]) => void;
	/** Called when cover image changes */
	onCoverChange?: (url: string) => void;
	/** Current cover image URL */
	coverImage?: string;
	/** Maximum number of images allowed */
	maxImages?: number;
	/** Cloudinary folder to upload to */
	folder?: UploadFolder | string;
	/** Maximum file size in bytes */
	maxSize?: number;
	/** Additional class names */
	className?: string;
	/** Disable the upload */
	disabled?: boolean;
	/** Show cover selection feature */
	showCoverSelection?: boolean;
	/** Minimum images required */
	minImages?: number;
}

export function ImageGalleryUpload({
	value = [],
	onChange,
	onCoverChange,
	coverImage,
	maxImages = 10,
	folder = UPLOAD_FOLDERS.LISTINGS,
	maxSize = MAX_FILE_SIZES.IMAGE,
	className,
	disabled = false,
	showCoverSelection = true,
	minImages = 1
}: ImageGalleryUploadProps) {
	const [images, setImages] = useState<UploadedImage[]>(() =>
		value.map((url, i) => ({ id: `existing-${i}`, url }))
	);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadError, setUploadError] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const canAddMore = images.length < maxImages;

	// Sync with external value
	const syncedImages = value.map((url, i) => {
		const existing = images.find((img) => img.url === url);
		return existing || { id: `synced-${i}`, url };
	});

	const handleFilesSelect = useCallback(
		async (files: FileList) => {
			const remainingSlots = maxImages - images.length;
			const filesToUpload = Array.from(files).slice(0, remainingSlots);

			if (filesToUpload.length === 0) {
				setUploadError(`Maximum ${maxImages} images allowed`);
				return;
			}

			setUploadError('');

			// Create placeholders for uploading images
			const newImages: UploadedImage[] = filesToUpload.map((file, i) => ({
				id: `uploading-${Date.now()}-${i}`,
				url: URL.createObjectURL(file),
				uploading: true
			}));

			setImages((prev) => [...prev, ...newImages]);

			// Upload each file
			for (let i = 0; i < filesToUpload.length; i++) {
				const file = filesToUpload[i];
				const imageId = newImages[i].id;

				// Validate
				const validation = validateImageFile(file, maxSize);
				if (!validation.valid) {
					setImages((prev) =>
						prev.map((img) =>
							img.id === imageId
								? { ...img, uploading: false, error: validation.error }
								: img
						)
					);
					continue;
				}

				// Upload
				const result = await uploadImage(file, { folder });

				if (result.success && result.url) {
					setImages((prev) => {
						const updated = prev.map((img) =>
							img.id === imageId
								? { id: imageId, url: result.url!, uploading: false }
								: img
						);
						// Notify parent of change
						const urls = updated.filter((img) => !img.uploading && !img.error).map((img) => img.url);
						onChange?.(urls);

						// Set first image as cover if none selected
						if (showCoverSelection && !coverImage && urls.length > 0) {
							onCoverChange?.(urls[0]);
						}

						return updated;
					});
				} else {
					setImages((prev) =>
						prev.map((img) =>
							img.id === imageId
								? { ...img, uploading: false, error: result.error || 'Upload failed' }
								: img
						)
					);
				}
			}
		},
		[maxImages, images.length, maxSize, folder, onChange, coverImage, showCoverSelection, onCoverChange]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);

			if (disabled || !canAddMore) return;

			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFilesSelect(files);
			}
		},
		[disabled, canAddMore, handleFilesSelect]
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (files && files.length > 0) {
				handleFilesSelect(files);
			}
			e.target.value = '';
		},
		[handleFilesSelect]
	);

	const handleRemove = useCallback(
		(imageId: string) => {
			setImages((prev) => {
				const updated = prev.filter((img) => img.id !== imageId);
				const urls = updated.filter((img) => !img.uploading && !img.error).map((img) => img.url);
				onChange?.(urls);

				// Update cover if removed
				const removedImage = prev.find((img) => img.id === imageId);
				if (removedImage && removedImage.url === coverImage && urls.length > 0) {
					onCoverChange?.(urls[0]);
				} else if (urls.length === 0) {
					onCoverChange?.('');
				}

				return updated;
			});
		},
		[onChange, coverImage, onCoverChange]
	);

	const handleSetCover = useCallback(
		(url: string) => {
			onCoverChange?.(url);
		},
		[onCoverChange]
	);

	const handleReorder = useCallback(
		(newOrder: UploadedImage[]) => {
			setImages(newOrder);
			const urls = newOrder.filter((img) => !img.uploading && !img.error).map((img) => img.url);
			onChange?.(urls);
		},
		[onChange]
	);

	const displayImages = images.length > 0 ? images : syncedImages;

	return (
		<div className={cn('space-y-4', className)}>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
				multiple
				onChange={handleInputChange}
				className="hidden"
				disabled={disabled}
			/>

			{/* Error message */}
			{uploadError && (
				<div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
					<AlertCircle className="h-4 w-4 shrink-0" />
					{uploadError}
				</div>
			)}

			{/* Image grid */}
			{displayImages.length > 0 && (
				<Reorder.Group
					axis="x"
					values={displayImages}
					onReorder={handleReorder}
					className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
				>
					<AnimatePresence mode="popLayout">
						{displayImages.map((image) => (
							<Reorder.Item
								key={image.id}
								value={image}
								className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-grab active:cursor-grabbing"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								{/* Image */}
								<Image
									src={image.url}
									alt="Uploaded"
									fill
									className={cn(
										'object-cover transition-opacity',
										image.uploading && 'opacity-50'
									)}
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
								/>

								{/* Uploading overlay */}
								{image.uploading && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/30">
										<Loader2 className="h-6 w-6 text-white animate-spin" />
									</div>
								)}

								{/* Error overlay */}
								{image.error && (
									<div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/80 text-white p-2">
										<AlertCircle className="h-6 w-6 mb-1" />
										<p className="text-xs text-center">{image.error}</p>
									</div>
								)}

								{/* Actions overlay */}
								{!image.uploading && !image.error && (
									<div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group">
										{/* Drag handle */}
										<div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<GripVertical className="h-5 w-5 text-white drop-shadow" />
										</div>

										{/* Cover badge */}
										{showCoverSelection && image.url === coverImage && (
											<div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
												<Star className="h-3 w-3 fill-current" />
												Cover
											</div>
										)}

										{/* Actions */}
										<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											{showCoverSelection && image.url !== coverImage && (
												<Button
													type="button"
													variant="secondary"
													size="icon"
													className="h-7 w-7"
													onClick={(e) => {
														e.stopPropagation();
														handleSetCover(image.url);
													}}
													title="Set as cover"
												>
													<Star className="h-3 w-3" />
												</Button>
											)}
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="h-7 w-7"
												onClick={(e) => {
													e.stopPropagation();
													handleRemove(image.id);
												}}
												disabled={disabled}
												title="Remove image"
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									</div>
								)}
							</Reorder.Item>
						))}
					</AnimatePresence>
				</Reorder.Group>
			)}

			{/* Add more zone */}
			{canAddMore && (
				<div
					onClick={() => !disabled && fileInputRef.current?.click()}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					className={cn(
						'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
						isDragging && !disabled && 'border-primary bg-primary/5 scale-[1.01]',
						!isDragging && 'border-muted-foreground/25 hover:border-primary/50',
						disabled && 'opacity-50 cursor-not-allowed'
					)}
				>
					{displayImages.length === 0 ? (
						<>
							<Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
							<p className="text-sm text-muted-foreground font-medium mb-1">
								Click or drag to upload images
							</p>
							<p className="text-xs text-muted-foreground">
								Upload {minImages > 1 ? `at least ${minImages}` : 'up to'} {maxImages} images (JPEG, PNG, WebP)
							</p>
						</>
					) : (
						<>
							<Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm text-muted-foreground">
								Add more images ({displayImages.length}/{maxImages})
							</p>
						</>
					)}
				</div>
			)}

			{/* Instructions */}
			{displayImages.length > 0 && showCoverSelection && (
				<p className="text-xs text-muted-foreground">
					Tip: Drag images to reorder. Click the star to set the cover image.
				</p>
			)}
		</div>
	);
}

export default ImageGalleryUpload;

