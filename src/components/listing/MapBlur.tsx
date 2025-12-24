'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MapPin, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { cn } from '@/lib/utils';

interface MapBlurProps {
	mapPreview: string;
	mapFull?: string;
	isUnlocked: boolean;
	onUnlock?: () => void;
	className?: string;
}

export function MapBlur({
	mapPreview,
	mapFull,
	isUnlocked,
	onUnlock,
	className
}: MapBlurProps) {
	const [isHovered, setIsHovered] = useState(false);

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
							className='relative h-64'>
							<Image
								src={mapFull || mapPreview}
								alt='Property location'
								fill
								sizes="(max-width: 1024px) 100vw, 66vw"
								className='object-cover'
							/>
							<div className='absolute top-2 right-2'>
								<Badge
									variant='success'
									className='flex items-center space-x-1'>
									<Unlock className='h-3 w-3' />
									<span>Unlocked</span>
								</Badge>
							</div>
						</motion.div>
					) : (
						<motion.div
							key='locked'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='relative h-64'>
							<Image
								src={mapPreview}
								alt='Property location (blurred)'
								fill
								sizes="(max-width: 1024px) 100vw, 66vw"
								className='object-cover blur-md'
							/>

							{/* Overlay */}
							<div className='absolute inset-0 bg-black/20' />

							{/* Lock Icon and Text */}
							<div className='absolute inset-0 flex flex-col items-center justify-center text-white'>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
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
								className='absolute bottom-4 left-1/2 -translate-x-1/2'>
								<Button
									onClick={onUnlock}
									onMouseEnter={() => setIsHovered(true)}
									onMouseLeave={() => setIsHovered(false)}
									className='bg-primary hover:bg-primary/90 text-white shadow-lg'>
									<motion.div
										animate={{ scale: isHovered ? 1.05 : 1 }}
										transition={{ type: 'spring', stiffness: 400, damping: 10 }}
										className='flex items-center space-x-2'>
										<MapPin className='h-4 w-4' />
										<span>Unlock Location (₦1,000)</span>
									</motion.div>
								</Button>
							</motion.div>

							{/* Lock Badge */}
							<div className='absolute top-2 right-2'>
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
