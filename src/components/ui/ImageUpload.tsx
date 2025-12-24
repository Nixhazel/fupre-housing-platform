'use client';

/**
 * ImageUpload Component
 *
 * A reusable single-image upload component with Cloudinary integration
 * Features:
 * - Drag and drop support
 * - Image preview
 * - Upload progress
 * - Error handling
 * - Responsive design
 */

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	uploadImage,
	validateImageFile,
	MAX_FILE_SIZES,
	UPLOAD_FOLDERS,
	type UploadFolder
} from '@/lib/cloudinary';

export interface ImageUploadProps {
	/** Current image URL (for controlled component) */
	value?: string;
	/** Called when image is uploaded successfully */
	onChange?: (url: string) => void;
	/** Called when image is removed */
	onRemove?: () => void;
	/** Called when upload fails */
	onError?: (error: string) => void;
	/** Cloudinary folder to upload to */
	folder?: UploadFolder | string;
	/** Maximum file size in bytes */
	maxSize?: number;
	/** Placeholder text */
	placeholder?: string;
	/** Additional class names */
	className?: string;
	/** Disable the upload */
	disabled?: boolean;
	/** Aspect ratio for preview (e.g., "16/9", "1/1", "4/3") */
	aspectRatio?: string;
	/** Show upload instructions */
	showInstructions?: boolean;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function ImageUpload({
	value,
	onChange,
	onRemove,
	onError,
	folder = UPLOAD_FOLDERS.LISTINGS,
	maxSize = MAX_FILE_SIZES.IMAGE,
	placeholder = 'Click or drag to upload an image',
	className,
	disabled = false,
	aspectRatio = '16/9',
	showInstructions = true
}: ImageUploadProps) {
	const [uploadState, setUploadState] = useState<UploadState>('idle');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [previewUrl, setPreviewUrl] = useState<string>('');
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = useCallback(
		async (file: File) => {
			// Validate file
			const validation = validateImageFile(file, maxSize);
			if (!validation.valid) {
				setErrorMessage(validation.error || 'Invalid file');
				setUploadState('error');
				onError?.(validation.error || 'Invalid file');
				return;
			}

			// Create preview
			const preview = URL.createObjectURL(file);
			setPreviewUrl(preview);
			setUploadState('uploading');
			setErrorMessage('');

			// Upload to Cloudinary
			const result = await uploadImage(file, { folder });

			// Clean up preview URL
			URL.revokeObjectURL(preview);

			if (result.success && result.url) {
				setUploadState('success');
				setPreviewUrl(result.url);
				onChange?.(result.url);

				// Reset to idle after showing success
				setTimeout(() => {
					setUploadState('idle');
				}, 1500);
			} else {
				setUploadState('error');
				setPreviewUrl('');
				setErrorMessage(result.error || 'Upload failed');
				onError?.(result.error || 'Upload failed');
			}
		},
		[folder, maxSize, onChange, onError]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);

			if (disabled || uploadState === 'uploading') return;

			const file = e.dataTransfer.files[0];
			if (file) {
				handleFileSelect(file);
			}
		},
		[disabled, uploadState, handleFileSelect]
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
			const file = e.target.files?.[0];
			if (file) {
				handleFileSelect(file);
			}
			// Reset input
			e.target.value = '';
		},
		[handleFileSelect]
	);

	const handleRemove = useCallback(() => {
		setPreviewUrl('');
		setUploadState('idle');
		setErrorMessage('');
		onRemove?.();
	}, [onRemove]);

	const handleClick = () => {
		if (!disabled && uploadState !== 'uploading') {
			fileInputRef.current?.click();
		}
	};

	const displayUrl = value || previewUrl;
	const hasImage = !!displayUrl;

	return (
		<div className={cn('relative', className)}>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
				onChange={handleInputChange}
				className="hidden"
				disabled={disabled}
			/>

			<div
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={cn(
					'relative overflow-hidden rounded-lg border-2 border-dashed transition-all cursor-pointer',
					isDragging && !disabled && 'border-primary bg-primary/5 scale-[1.02]',
					!isDragging && !hasImage && 'border-muted-foreground/25 hover:border-primary/50',
					hasImage && 'border-transparent',
					disabled && 'opacity-50 cursor-not-allowed',
					uploadState === 'error' && 'border-red-500'
				)}
				style={{ aspectRatio }}
			>
				<AnimatePresence mode="wait">
					{hasImage ? (
						<motion.div
							key="image"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="relative w-full h-full"
						>
							<Image
								src={displayUrl}
								alt="Uploaded image"
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							/>

							{/* Overlay with remove button */}
							<div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group">
								<Button
									type="button"
									variant="destructive"
									size="icon"
									className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={(e) => {
										e.stopPropagation();
										handleRemove();
									}}
									disabled={disabled}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Upload state overlay */}
							{uploadState === 'uploading' && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<div className="text-center text-white">
										<Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
										<p className="text-sm">Uploading...</p>
									</div>
								</div>
							)}

							{uploadState === 'success' && (
								<motion.div
									initial={{ opacity: 0, scale: 0.5 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0 }}
									className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
								>
									<CheckCircle2 className="h-12 w-12 text-green-500" />
								</motion.div>
							)}
						</motion.div>
					) : (
						<motion.div
							key="placeholder"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
						>
							{uploadState === 'uploading' ? (
								<>
									<Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
									<p className="text-sm text-muted-foreground">Uploading...</p>
								</>
							) : uploadState === 'error' ? (
								<>
									<AlertCircle className="h-10 w-10 text-red-500 mb-4" />
									<p className="text-sm text-red-500 font-medium mb-2">Upload failed</p>
									<p className="text-xs text-muted-foreground">{errorMessage}</p>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="mt-4"
										onClick={(e) => {
											e.stopPropagation();
											setUploadState('idle');
											setErrorMessage('');
										}}
									>
										Try again
									</Button>
								</>
							) : (
								<>
									<Upload className="h-10 w-10 text-muted-foreground mb-4" />
									<p className="text-sm text-muted-foreground font-medium mb-1">
										{placeholder}
									</p>
									{showInstructions && (
										<p className="text-xs text-muted-foreground">
											JPEG, PNG, WebP or GIF (max {Math.round(maxSize / 1024 / 1024)}MB)
										</p>
									)}
								</>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default ImageUpload;

