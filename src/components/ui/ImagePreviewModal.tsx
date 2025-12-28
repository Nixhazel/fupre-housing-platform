'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
	X,
	ChevronLeft,
	ChevronRight,
	ZoomIn,
	ZoomOut,
	Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImagePreviewModalProps {
	images: string[];
	initialIndex: number;
	isOpen: boolean;
	onClose: () => void;
	title?: string;
}

export function ImagePreviewModal({
	images,
	initialIndex,
	isOpen,
	onClose,
	title
}: ImagePreviewModalProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [isZoomed, setIsZoomed] = useState(false);

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
			setIsZoomed(false);
		}
	}, [isOpen, initialIndex]);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen) return;

			switch (e.key) {
				case 'Escape':
					onClose();
					break;
				case 'ArrowLeft':
					setCurrentIndex((prev) =>
						prev > 0 ? prev - 1 : images.length - 1
					);
					setIsZoomed(false);
					break;
				case 'ArrowRight':
					setCurrentIndex((prev) =>
						prev < images.length - 1 ? prev + 1 : 0
					);
					setIsZoomed(false);
					break;
			}
		},
		[isOpen, images.length, onClose]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
		setIsZoomed(false);
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
		setIsZoomed(false);
	};

	const toggleZoom = () => {
		setIsZoomed((prev) => !prev);
	};

	const handleDownload = async () => {
		const imageUrl = images[currentIndex];
		try {
			const response = await fetch(imageUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `image-${currentIndex + 1}.jpg`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch {
			// Fallback: open in new tab
			window.open(imageUrl, '_blank');
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-50 flex items-center justify-center'
					onClick={onClose}>
					{/* Backdrop */}
					<div className='absolute inset-0 bg-black/90' />

					{/* Modal Content */}
					<div
						className='relative z-10 w-full h-full flex flex-col'
						onClick={(e) => e.stopPropagation()}>
						{/* Header */}
						<div className='absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent'>
							<div className='text-white'>
								{title && (
									<h3 className='text-lg font-semibold truncate max-w-[50vw]'>
										{title}
									</h3>
								)}
								<p className='text-sm text-white/70'>
									{currentIndex + 1} of {images.length}
								</p>
							</div>

							<div className='flex items-center gap-2'>
								<Button
									variant='ghost'
									size='icon'
									className='text-white hover:bg-white/20'
									onClick={toggleZoom}
									title={isZoomed ? 'Zoom out' : 'Zoom in'}>
									{isZoomed ? (
										<ZoomOut className='h-5 w-5' />
									) : (
										<ZoomIn className='h-5 w-5' />
									)}
								</Button>
								<Button
									variant='ghost'
									size='icon'
									className='text-white hover:bg-white/20'
									onClick={handleDownload}
									title='Download image'>
									<Download className='h-5 w-5' />
								</Button>
								<Button
									variant='ghost'
									size='icon'
									className='text-white hover:bg-white/20'
									onClick={onClose}
									title='Close (Esc)'>
									<X className='h-5 w-5' />
								</Button>
							</div>
						</div>

						{/* Main Image */}
						<div className='flex-1 flex items-center justify-center p-4 pt-20 pb-24'>
							<motion.div
								key={currentIndex}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.2 }}
								className={cn(
									'relative w-full h-full',
									isZoomed
										? 'cursor-zoom-out overflow-auto'
										: 'cursor-zoom-in'
								)}
								onClick={toggleZoom}>
								<Image
									src={images[currentIndex]}
									alt={`Image ${currentIndex + 1}`}
									fill
									sizes='100vw'
									className={cn(
										'transition-transform duration-200',
										isZoomed
											? 'object-contain scale-150'
											: 'object-contain'
									)}
									priority
								/>
							</motion.div>
						</div>

						{/* Navigation Arrows */}
						{images.length > 1 && (
							<>
								<Button
									variant='ghost'
									size='icon'
									className='absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70'
									onClick={goToPrevious}
									title='Previous (←)'>
									<ChevronLeft className='h-8 w-8' />
								</Button>
								<Button
									variant='ghost'
									size='icon'
									className='absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70'
									onClick={goToNext}
									title='Next (→)'>
									<ChevronRight className='h-8 w-8' />
								</Button>
							</>
						)}

						{/* Thumbnail Strip */}
						{images.length > 1 && (
							<div className='absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/50 to-transparent'>
								<div className='flex justify-center gap-2 overflow-x-auto py-2'>
									{images.map((image, index) => (
										<button
											key={index}
											onClick={() => {
												setCurrentIndex(index);
												setIsZoomed(false);
											}}
											className={cn(
												'relative w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-all border-2',
												currentIndex === index
													? 'border-white ring-2 ring-white/50'
													: 'border-transparent opacity-60 hover:opacity-100'
											)}>
											<Image
												src={image}
												alt={`Thumbnail ${index + 1}`}
												fill
												sizes='64px'
												className='object-cover'
											/>
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

