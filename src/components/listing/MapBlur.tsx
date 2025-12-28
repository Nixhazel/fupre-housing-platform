'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MapPin, Unlock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { cn } from '@/lib/utils';
import { formatUnlockFee } from '@/lib/config/env';

interface MapBlurProps {
	mapPreview: string;
	mapFull?: string;
	isUnlocked: boolean;
	onUnlock?: () => void;
	className?: string;
}

/**
 * Detect the type of map URL
 * - 'embed': Google Maps embed URL (can be used in iframe)
 * - 'image': Direct image URL (static map image)
 * - 'link': Regular Google Maps link (open in new tab)
 */
function getMapUrlType(
	url: string
): 'embed' | 'image' | 'link' | 'staticapi' | 'unknown' {
	if (!url) return 'unknown';

	const lowerUrl = url.toLowerCase();

	// Google Maps Embed URL (iframe compatible)
	if (
		lowerUrl.includes('google.com/maps/embed') ||
		lowerUrl.includes('maps.google.com/maps?') ||
		lowerUrl.includes('google.com/maps?') ||
		lowerUrl.includes('/maps/d/embed')
	) {
		return 'embed';
	}

	// Google Maps Static API (image)
	if (lowerUrl.includes('maps.googleapis.com/maps/api/staticmap')) {
		return 'staticapi';
	}

	// Direct image URLs
	if (
		lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ||
		lowerUrl.includes('cloudinary.com') ||
		lowerUrl.includes('imgur.com') ||
		lowerUrl.includes('unsplash.com')
	) {
		return 'image';
	}

	// Regular Google Maps links
	if (
		lowerUrl.includes('google.com/maps') ||
		lowerUrl.includes('maps.google.com') ||
		lowerUrl.includes('goo.gl/maps') ||
		lowerUrl.includes('maps.app.goo.gl')
	) {
		return 'link';
	}

	return 'unknown';
}

/**
 * Convert a Google Maps link to an embed URL if possible
 */
function convertToEmbedUrl(url: string): string | null {
	if (!url) return null;

	// Already an embed URL
	if (url.includes('google.com/maps/embed')) {
		return url;
	}

	// Try to extract place/coordinates from the URL
	// Format: https://www.google.com/maps/place/.../@lat,lng,zoom
	const placeMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)z/);
	if (placeMatch) {
		const [, lat, lng, zoom] = placeMatch;
		return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${
			Math.pow(2, 21 - parseFloat(zoom)) * 1000
		}!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sng!4v${Date.now()}`;
	}

	// Try query parameter format: ?q=lat,lng
	const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
	if (queryMatch) {
		const [, lat, lng] = queryMatch;
		return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sng!4v${Date.now()}`;
	}

	return null;
}

export function MapBlur({
	mapPreview,
	mapFull,
	isUnlocked,
	onUnlock,
	className
}: MapBlurProps) {
	const [isHovered, setIsHovered] = useState(false);

	// Determine the current URL and its type
	const currentUrl = isUnlocked ? mapFull || mapPreview : mapPreview;
	const urlType = useMemo(() => getMapUrlType(currentUrl), [currentUrl]);
	const embedUrl = useMemo(
		() => (urlType === 'link' ? convertToEmbedUrl(currentUrl) : null),
		[currentUrl, urlType]
	);

	// Render the appropriate map component based on URL type
	const renderMap = (url: string, isBlurred: boolean = false) => {
		const type = getMapUrlType(url);
		const embed = type === 'link' ? convertToEmbedUrl(url) : null;

		// Use iframe for embed URLs or converted links
		if (type === 'embed' || embed) {
			return (
				<div className={cn('relative h-64 w-full', isBlurred && 'blur-md')}>
					<iframe
						src={embed || url}
						width='100%'
						height='100%'
						style={{ border: 0 }}
						allowFullScreen
						loading='lazy'
						referrerPolicy='no-referrer-when-downgrade'
						title='Property location map'
						className='rounded-lg'
					/>
					{isBlurred && <div className='absolute inset-0 bg-black/20' />}
				</div>
			);
		}

		// Use Image for static map images or image URLs
		if (type === 'image' || type === 'staticapi') {
			return (
				<div className='relative h-64'>
					<Image
						src={url}
						alt='Property location'
						fill
						sizes='(max-width: 1024px) 100vw, 66vw'
						className={cn('object-cover', isBlurred && 'blur-md')}
					/>
					{isBlurred && <div className='absolute inset-0 bg-black/20' />}
				</div>
			);
		}

		// For regular Google Maps links, show a placeholder with link
		if (type === 'link') {
			return (
				<div
					className={cn(
						'relative h-64 bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex flex-col items-center justify-center',
						isBlurred && 'blur-md'
					)}>
					<MapPin className='h-12 w-12 text-blue-500 mb-2' />
					<p className='text-sm text-blue-600 dark:text-blue-400'>
						Google Maps Location
					</p>
					{!isBlurred && (
						<Button
							variant='outline'
							size='sm'
							className='mt-3'
							onClick={() => window.open(url, '_blank')}>
							<ExternalLink className='h-4 w-4 mr-2' />
							Open in Google Maps
						</Button>
					)}
				</div>
			);
		}

		// Fallback for unknown URL types
		return (
			<div
				className={cn(
					'relative h-64 bg-muted flex items-center justify-center',
					isBlurred && 'blur-md'
				)}>
				<div className='text-center'>
					<MapPin className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
					<p className='text-sm text-muted-foreground'>Map not available</p>
				</div>
			</div>
		);
	};

	return (
		<div className={cn('relative overflow-hidden rounded-lg', className)}>
			<div className='relative'>
				<AnimatePresence mode='wait'>
					{isUnlocked ? (
						<motion.div
							key='unlocked'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='relative'>
							{renderMap(mapFull || mapPreview, false)}
							<div className='absolute top-2 right-2 z-10'>
								<Badge
									variant='success'
									className='flex items-center space-x-1'>
									<Unlock className='h-3 w-3' />
									<span>Unlocked</span>
								</Badge>
							</div>
							{/* Show "Open in Maps" button for all link types when unlocked */}
							{(urlType === 'embed' || embedUrl) && (
								<div className='absolute bottom-2 right-2 z-10'>
									<Button
										variant='secondary'
										size='sm'
										onClick={() =>
											window.open(mapFull || mapPreview, '_blank')
										}>
										<ExternalLink className='h-4 w-4 mr-2' />
										Open in Maps
									</Button>
								</div>
							)}
						</motion.div>
					) : (
						<motion.div
							key='locked'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='relative'>
							{renderMap(mapPreview, true)}

							{/* Lock Icon and Text Overlay */}
							<div className='absolute inset-0 flex flex-col items-center justify-center text-white z-10'>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{
										delay: 0.2,
										type: 'spring',
										stiffness: 200
									}}
									className='mb-4 p-4 rounded-full bg-white/20 backdrop-blur-sm'>
									<Lock className='h-8 w-8' />
								</motion.div>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className='text-center space-y-2'>
									<h3 className='text-lg font-semibold'>Location Locked</h3>
									<p className='text-sm opacity-90 max-w-xs'>
										Upload payment proof to unlock the exact location and
										contact details
									</p>
								</motion.div>
							</div>

							{/* Unlock Button */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10'>
								<Button
									onClick={onUnlock}
									onMouseEnter={() => setIsHovered(true)}
									onMouseLeave={() => setIsHovered(false)}
									className='bg-primary hover:bg-primary/90 text-white shadow-lg'>
									<motion.div
										animate={{ scale: isHovered ? 1.05 : 1 }}
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 10
										}}
										className='flex items-center space-x-2'>
										<MapPin className='h-4 w-4' />
										<span>Unlock Location ({formatUnlockFee()})</span>
									</motion.div>
								</Button>
							</motion.div>

							{/* Lock Badge */}
							<div className='absolute top-2 right-2 z-10'>
								<Badge
									variant='warning'
									className='flex items-center space-x-1'>
									<Lock className='h-3 w-3' />
									<span>Locked</span>
								</Badge>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
