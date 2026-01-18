'use client';

/**
 * VideoGalleryUpload Component
 *
 * A reusable video upload component with Cloudinary integration
 * Features:
 * - Multiple video upload (up to 3)
 * - Drag and drop support
 * - Upload progress
 * - Video preview with playback
 */

import { useState, useCallback, useRef } from 'react';
import {
	X,
	Loader2,
	AlertCircle,
	Plus,
	Video,
	Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	uploadVideo,
	validateVideoFile,
	MAX_FILE_SIZES,
	UPLOAD_FOLDERS,
	type UploadFolder
} from '@/lib/cloudinary';

export interface UploadedVideo {
	id: string;
	url: string;
	uploading?: boolean;
	progress?: number;
	error?: string;
	duration?: number;
}

export interface VideoGalleryUploadProps {
	/** Current video URLs (for controlled component) */
	value?: string[];
	/** Called when videos change */
	onChange?: (urls: string[]) => void;
	/** Maximum number of videos allowed */
	maxVideos?: number;
	/** Cloudinary folder to upload to */
	folder?: UploadFolder | string;
	/** Maximum file size in bytes */
	maxSize?: number;
	/** Additional class names */
	className?: string;
	/** Disable the upload */
	disabled?: boolean;
}

export function VideoGalleryUpload({
	value = [],
	onChange,
	maxVideos = 3,
	folder = UPLOAD_FOLDERS.LISTING_VIDEOS,
	maxSize = MAX_FILE_SIZES.VIDEO,
	className,
	disabled = false
}: VideoGalleryUploadProps) {
	const [videos, setVideos] = useState<UploadedVideo[]>(() =>
		value.map((url, i) => ({ id: `existing-${i}`, url }))
	);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadError, setUploadError] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const canAddMore = videos.length < maxVideos;

	// Sync with external value
	const syncedVideos = value.map((url, i) => {
		const existing = videos.find((vid) => vid.url === url);
		return existing || { id: `synced-${i}`, url };
	});

	const handleFilesSelect = useCallback(
		async (files: FileList) => {
			const remainingSlots = maxVideos - videos.length;
			const filesToUpload = Array.from(files).slice(0, remainingSlots);

			if (filesToUpload.length === 0) {
				setUploadError(`Maximum ${maxVideos} videos allowed`);
				return;
			}

			setUploadError('');

			// Create placeholders for uploading videos
			const newVideos: UploadedVideo[] = filesToUpload.map((file, i) => ({
				id: `uploading-${Date.now()}-${i}`,
				url: URL.createObjectURL(file),
				uploading: true
			}));

			setVideos((prev) => [...prev, ...newVideos]);

			// Upload each file
			for (let i = 0; i < filesToUpload.length; i++) {
				const file = filesToUpload[i];
				const videoId = newVideos[i].id;

				// Validate
				const validation = validateVideoFile(file, maxSize);
				if (!validation.valid) {
					setVideos((prev) =>
						prev.map((vid) =>
							vid.id === videoId
								? { ...vid, uploading: false, error: validation.error }
								: vid
						)
					);
					continue;
				}

				// Upload
				const result = await uploadVideo(file, { folder });

				if (result.success && result.url) {
					setVideos((prev) => {
						const updated = prev.map((vid) =>
							vid.id === videoId
								? { id: videoId, url: result.url!, uploading: false, duration: result.duration }
								: vid
						);
						// Notify parent of change
						const urls = updated.filter((vid) => !vid.uploading && !vid.error).map((vid) => vid.url);
						onChange?.(urls);
						return updated;
					});
				} else {
					setVideos((prev) =>
						prev.map((vid) =>
							vid.id === videoId
								? { ...vid, uploading: false, error: result.error || 'Upload failed' }
								: vid
						)
					);
				}
			}
		},
		[maxVideos, videos.length, maxSize, folder, onChange]
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
		(videoId: string) => {
			setVideos((prev) => {
				const updated = prev.filter((vid) => vid.id !== videoId);
				const urls = updated.filter((vid) => !vid.uploading && !vid.error).map((vid) => vid.url);
				onChange?.(urls);
				return updated;
			});
		},
		[onChange]
	);

	const displayVideos = videos.length > 0 ? videos : syncedVideos;

	return (
		<div className={cn('space-y-4', className)}>
			<input
				ref={fileInputRef}
				type="file"
				accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
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

			{/* Video grid */}
			{displayVideos.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{displayVideos.map((video) => (
						<div
							key={video.id}
							className="relative aspect-video rounded-lg overflow-hidden bg-muted"
						>
							{/* Video preview */}
							{!video.uploading && !video.error && (
								<video
									src={video.url}
									className="w-full h-full object-cover"
									controls
									preload="metadata"
								/>
							)}

							{/* Uploading placeholder */}
							{video.uploading && (
								<div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
									<Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
									<p className="text-sm text-muted-foreground">Uploading video...</p>
								</div>
							)}

							{/* Error overlay */}
							{video.error && (
								<div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/80 text-white p-4">
									<AlertCircle className="h-8 w-8 mb-2" />
									<p className="text-sm text-center">{video.error}</p>
								</div>
							)}

							{/* Remove button */}
							{!video.uploading && (
								<Button
									type="button"
									variant="destructive"
									size="icon"
									className="absolute top-2 right-2 h-8 w-8"
									onClick={() => handleRemove(video.id)}
									disabled={disabled}
									title="Remove video"
								>
									<X className="h-4 w-4" />
								</Button>
							)}

							{/* Video icon badge */}
							{!video.uploading && !video.error && (
								<div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
									<Play className="h-3 w-3" />
									Video
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Add video zone */}
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
					{displayVideos.length === 0 ? (
						<>
							<Video className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
							<p className="text-sm text-muted-foreground font-medium mb-1">
								Click or drag to upload videos
							</p>
							<p className="text-xs text-muted-foreground">
								Upload up to {maxVideos} videos (MP4, WebM, MOV - max 100MB each)
							</p>
						</>
					) : (
						<>
							<Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm text-muted-foreground">
								Add more videos ({displayVideos.length}/{maxVideos})
							</p>
						</>
					)}
				</div>
			)}

			{/* Instructions */}
			{displayVideos.length > 0 && (
				<p className="text-xs text-muted-foreground">
					Tip: Upload property walkthrough videos to help students better understand the space.
				</p>
			)}
		</div>
	);
}

export default VideoGalleryUpload;
