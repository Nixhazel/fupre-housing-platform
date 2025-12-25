'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
	ArrowLeft,
	Calendar,
	Users,
	Heart,
	MessageCircle,
	Share2,
	Clock,
	MapPin,
	Ban,
	PawPrint,
	Sparkles,
	Loader2,
	AlertCircle,
	Mail,
	Phone,
	Copy,
	Check,
	Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/shared/Skeleton';
import { useRoommate, useSaveRoommate, useUnsaveRoommate } from '@/hooks/api/useRoommates';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatNaira } from '@/lib/utils/currency';
import { dayjs } from '@/lib/utils/date';
import { toast } from 'sonner';
import Link from 'next/link';

function RoommateDetailContent() {
	const params = useParams();
	const router = useRouter();
	const listingId = params.id as string;

	// TanStack Query hooks
	const { user: currentUser, isAuthenticated } = useAuth();
	const {
		data: roommateData,
		isLoading,
		isError,
		error
	} = useRoommate(listingId);

	// Save/unsave mutations
	const saveMutation = useSaveRoommate();
	const unsaveMutation = useUnsaveRoommate();

	const roommateListing = roommateData?.listing;
	const owner = roommateListing?.owner;

	// Check if listing is saved
	const isSaved = currentUser?.savedRoommateIds?.includes(listingId) ?? false;
	const isSaving = saveMutation.isPending || unsaveMutation.isPending;

	// Contact reveal state
	const [showContact, setShowContact] = useState(false);
	const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);

	// Check if this is the user's own listing
	const isOwnListing = currentUser?.id === owner?.id;

	const handleCopy = async (text: string, field: 'email' | 'phone') => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(field);
			toast.success(`${field === 'email' ? 'Email' : 'Phone'} copied to clipboard`);
			setTimeout(() => setCopiedField(null), 2000);
		} catch {
			toast.error('Failed to copy to clipboard');
		}
	};

	const handleShare = async () => {
		if (!roommateListing) return;

		if (navigator.share) {
			try {
				await navigator.share({
					title: roommateListing.title,
					text: `Check out this roommate listing: ${roommateListing.title}`,
					url: window.location.href
				});
			} catch {
				// Fallback to clipboard
				navigator.clipboard.writeText(window.location.href);
				toast.success('Link copied to clipboard');
			}
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('Link copied to clipboard');
		}
	};

	const handleContact = () => {
		if (!isAuthenticated || !currentUser) {
			toast.error('Please login to view contact info');
			router.push(`/auth/login?returnUrl=/roommates/${listingId}`);
			return;
		}
		setShowContact(true);
	};

	const handleSave = () => {
		if (!isAuthenticated || !currentUser) {
			toast.error('Please login to save listings');
			router.push(`/auth/login?returnUrl=/roommates/${listingId}`);
			return;
		}

		if (isSaved) {
			unsaveMutation.mutate(listingId, {
				onSuccess: () => toast.success('Removed from favorites'),
				onError: (err) => toast.error(err.message || 'Failed to remove')
			});
		} else {
			saveMutation.mutate(listingId, {
				onSuccess: () => toast.success('Added to favorites'),
				onError: (err) => toast.error(err.message || 'Failed to save')
			});
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen bg-background'>
				<div className='container mx-auto px-4 py-8'>
					<Skeleton className='h-10 w-40 mb-6' />
					<Skeleton className='h-8 w-3/4 mb-2' />
					<Skeleton className='h-4 w-1/2 mb-8' />
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						<div className='lg:col-span-2 space-y-6'>
							<Card>
								<CardContent className='p-4'>
									<div className='grid grid-cols-2 gap-2'>
										<Skeleton className='aspect-video rounded-lg' />
										<Skeleton className='aspect-video rounded-lg' />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<Skeleton className='h-6 w-32' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-4 w-full mb-2' />
									<Skeleton className='h-4 w-3/4 mb-2' />
									<Skeleton className='h-4 w-1/2' />
								</CardContent>
							</Card>
						</div>
						<div className='space-y-6'>
							<Card>
								<CardHeader>
									<Skeleton className='h-6 w-24' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-8 w-1/2 mb-4' />
									<Skeleton className='h-4 w-full mb-4' />
									<Skeleton className='h-4 w-3/4' />
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError || !roommateListing) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Card className='max-w-md text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
						<h1 className='text-2xl font-bold mb-4'>
							Roommate Listing Not Found
						</h1>
						<p className='text-muted-foreground mb-6'>
							{error?.message ||
								"The roommate listing you're looking for doesn't exist or has been removed."}
						</p>
						<Button asChild>
							<Link href='/roommates'>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back to Roommates
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const preferenceIcons = {
		gender: Users,
		cleanliness: Sparkles,
		studyHours: Clock,
		smoking: Ban,
		pets: PawPrint
	};

	const getPreferenceLabel = (key: string, value: string) => {
		switch (key) {
			case 'gender':
				return value === 'any' ? 'Any gender' : `Looking for ${value}`;
			case 'cleanliness':
				return `Cleanliness: ${value}`;
			case 'studyHours':
				return `Study hours: ${value}`;
			case 'smoking':
				return value === 'no'
					? 'No smoking'
					: value === 'yes'
					? 'Smoking allowed'
					: 'Outdoor smoking only';
			case 'pets':
				return value === 'no' ? 'No pets' : 'Pets allowed';
			default:
				return value;
		}
	};

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-6'>
					<Button
						variant='ghost'
						onClick={() => router.push('/roommates')}
						className='mb-4'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Roommates
					</Button>
					<h1 className='text-3xl font-bold mb-2'>{roommateListing.title}</h1>
					<div className='flex items-center gap-4 text-muted-foreground'>
						<div className='flex items-center gap-1'>
							<Calendar className='h-4 w-4' />
							<span>
								Posted {dayjs(roommateListing.createdAt).format('MMM D, YYYY')}
							</span>
						</div>
						<div className='flex items-center gap-1'>
							<MapPin className='h-4 w-4' />
							<span>Campus Area</span>
						</div>
					</div>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Main Content */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Photos */}
						<Card>
							<CardContent className='p-0'>
								{roommateListing.photos.length > 0 ? (
									<div className='grid grid-cols-1 md:grid-cols-2 gap-2 p-4'>
										{roommateListing.photos.map((photo, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, scale: 0.9 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: index * 0.1 }}
												className='aspect-video rounded-lg overflow-hidden relative'>
												<Image
													src={photo}
													alt={`Roommate listing photo ${index + 1}`}
													fill
													sizes="(max-width: 768px) 100vw, 50vw"
													className='object-cover'
												/>
											</motion.div>
										))}
									</div>
								) : (
									<div className='aspect-video bg-muted flex items-center justify-center'>
										<p className='text-muted-foreground'>No photos available</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Description */}
						<Card>
							<CardHeader>
								<CardTitle>Description</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-muted-foreground leading-relaxed'>
									{roommateListing.description}
								</p>
							</CardContent>
						</Card>

						{/* Preferences */}
						<Card>
							<CardHeader>
								<CardTitle>Preferences</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									{Object.entries(roommateListing.preferences).map(
										([key, value]) => {
											if (!value) return null;
											const Icon =
												preferenceIcons[key as keyof typeof preferenceIcons];
											return (
												<motion.div
													key={key}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
													<Icon className='h-5 w-5 text-primary' />
													<span className='font-medium'>
														{getPreferenceLabel(key, value)}
													</span>
												</motion.div>
											);
										}
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className='space-y-6'>
						{/* Budget & Move-in */}
						<Card>
							<CardHeader>
								<CardTitle>Details</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Budget</span>
									<span className='text-2xl font-bold text-primary'>
										{formatNaira(roommateListing.budgetMonthly)}
									</span>
								</div>
								<Separator />
								<div className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Move-in Date</span>
									<span className='font-medium'>
										{dayjs(roommateListing.moveInDate).format('MMM D, YYYY')}
									</span>
								</div>
								<Separator />
								<div className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Owner Type</span>
									<Badge
										variant={
											roommateListing.ownerType === 'owner'
												? 'default'
												: 'secondary'
										}>
										{roommateListing.ownerType === 'owner'
											? 'Property Owner'
											: 'Student'}
									</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Owner Info */}
						{owner && (
							<Card>
								<CardHeader>
									<CardTitle>Posted by</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='flex items-center gap-3 mb-4'>
										<Avatar className='h-12 w-12'>
											<AvatarImage src={owner.avatarUrl} alt={owner.name} />
											<AvatarFallback>
												{owner.name
													.split(' ')
													.map((n) => n[0])
													.join('')}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className='font-semibold'>{owner.name}</h3>
											<div className='flex items-center gap-2'>
												<Badge
													variant={owner.isVerified ? 'default' : 'secondary'}>
													{owner.role.charAt(0).toUpperCase() +
														owner.role.slice(1)}
												</Badge>
												{owner.isVerified && (
													<Badge
														variant='outline'
														className='text-green-600 border-green-600'>
														Verified
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className='text-sm text-muted-foreground'>
										Member since {dayjs(owner.createdAt).format('MMM YYYY')}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Contact & Actions */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<MessageCircle className='h-5 w-5' />
									Contact Information
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<AnimatePresence mode='wait'>
									{showContact && owner && isAuthenticated ? (
										<motion.div
											key='contact-info'
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											className='space-y-3'>
											{/* Email */}
											{owner.email && (
												<div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
													<div className='flex items-center gap-3'>
														<Mail className='h-5 w-5 text-primary' />
														<div>
															<p className='text-xs text-muted-foreground'>Email</p>
															<p className='font-medium text-sm'>{owner.email}</p>
														</div>
													</div>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => handleCopy(owner.email, 'email')}>
														{copiedField === 'email' ? (
															<Check className='h-4 w-4 text-green-500' />
														) : (
															<Copy className='h-4 w-4' />
														)}
													</Button>
												</div>
											)}

											{/* Phone */}
											{owner.phone && (
												<div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
													<div className='flex items-center gap-3'>
														<Phone className='h-5 w-5 text-primary' />
														<div>
															<p className='text-xs text-muted-foreground'>Phone</p>
															<p className='font-medium text-sm'>{owner.phone}</p>
														</div>
													</div>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => handleCopy(owner.phone!, 'phone')}>
														{copiedField === 'phone' ? (
															<Check className='h-4 w-4 text-green-500' />
														) : (
															<Copy className='h-4 w-4' />
														)}
													</Button>
												</div>
											)}

											{!owner.phone && !owner.email && (
												<p className='text-sm text-muted-foreground text-center py-2'>
													No contact information available
												</p>
											)}

											<Separator />
										</motion.div>
									) : (
										<motion.div
											key='contact-cta'
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className='text-center py-4'>
											{isOwnListing ? (
												<p className='text-sm text-muted-foreground'>
													This is your listing
												</p>
											) : (
												<>
													<div className='p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 mb-4'>
														<Eye className='h-8 w-8 mx-auto mb-2 text-primary' />
														<p className='text-sm text-muted-foreground'>
															Click below to reveal contact information
														</p>
														<p className='text-xs text-green-600 mt-1 font-medium'>
															✓ Free for all users
														</p>
													</div>
													<Button className='w-full' onClick={handleContact}>
														<MessageCircle className='h-4 w-4 mr-2' />
														{isAuthenticated ? 'View Contact Info' : 'Login to Contact'}
													</Button>
												</>
											)}
										</motion.div>
									)}
								</AnimatePresence>

								<div className='space-y-3'>
									<Button
										variant='outline'
										className='w-full'
										onClick={handleSave}
										disabled={isSaving}>
										{isSaving ? (
											<Loader2 className='h-4 w-4 mr-2 animate-spin' />
										) : (
											<Heart
												className={`h-4 w-4 mr-2 ${
													isSaved ? 'fill-red-500 text-red-500' : ''
												}`}
											/>
										)}
										{isSaved ? 'Saved' : 'Save'}
									</Button>
									<Button
										variant='outline'
										className='w-full'
										onClick={handleShare}>
										<Share2 className='h-4 w-4 mr-2' />
										Share
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function RoommateDetailPage() {
	return <RoommateDetailContent />;
}
