'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
	Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRoommatesStore } from '@/lib/store/roommatesSlice';
import { useAuthStore } from '@/lib/store/authSlice';
import { formatNaira } from '@/lib/utils/currency';
import { dayjs } from '@/lib/utils/date';
import { RoommateListing, User as UserType } from '@/types';
import { usersData } from '@/data/users';
import { toast } from 'sonner';

function RoommateDetailContent() {
	const params = useParams();
	const router = useRouter();
	const { roommateListings } = useRoommatesStore();
	const { user: currentUser } = useAuthStore();

	const [roommateListing, setRoommateListing] =
		useState<RoommateListing | null>(null);
	const [owner, setOwner] = useState<UserType | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const listingId = params.id as string;
		const listing = roommateListings.find((l) => l.id === listingId);

		if (listing) {
			setRoommateListing(listing);
			// Find the owner
			const ownerData = usersData.find((u) => u.id === listing.ownerId);
			setOwner(ownerData || null);
		}
		setIsLoading(false);
	}, [params.id, roommateListings]);

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
		if (!currentUser) {
			toast.error('Please login to contact this person');
			router.push('/auth/login');
			return;
		}
		toast.success('Contact feature coming soon!');
	};

	const handleSave = () => {
		if (!currentUser) {
			toast.error('Please login to save listings');
			router.push('/auth/login');
			return;
		}
		toast.success('Saved to favorites!');
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>Loading...</p>
				</div>
			</div>
		);
	}

	if (!roommateListing) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold mb-4'>
						Roommate Listing Not Found
					</h1>
					<p className='text-muted-foreground mb-6'>
						The roommate listing you&apos;re looking for doesn&apos;t exist or
						has been removed.
					</p>
					<Button onClick={() => router.push('/roommates')}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Roommates
					</Button>
				</div>
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
							<span>FUPRE Area</span>
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
													variant={owner.verified ? 'default' : 'secondary'}>
													{owner.role.charAt(0).toUpperCase() +
														owner.role.slice(1)}
												</Badge>
												{owner.verified && (
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

						{/* Actions */}
						<Card>
							<CardContent className='pt-6'>
								<div className='space-y-3'>
									<Button className='w-full' onClick={handleContact}>
										<MessageCircle className='h-4 w-4 mr-2' />
										Contact
									</Button>
									<Button
										variant='outline'
										className='w-full'
										onClick={handleSave}>
										<Heart className='h-4 w-4 mr-2' />
										Save
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
