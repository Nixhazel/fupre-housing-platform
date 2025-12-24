'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { ImageGalleryUpload } from '@/components/ui/ImageGalleryUpload';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { useCreateRoommate } from '@/hooks/api/useRoommates';
import {
	roommateSchema,
	type RoommateFormData
} from '@/lib/validators/roommates';
import { toast } from 'sonner';
import { UPLOAD_FOLDERS, MAX_FILE_SIZES } from '@/lib/cloudinary';
import Link from 'next/link';

export default function NewRoommatePage() {
	const router = useRouter();

	// TanStack Query hooks
	const { data: user, isLoading: isUserLoading, isAuthenticated } = useCurrentUser();
	const createRoommateMutation = useCreateRoommate();

	// Local state for image URLs
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm<RoommateFormData>({
		resolver: zodResolver(roommateSchema)
	});

	// Handle image upload from Cloudinary
	const handleImagesChange = (urls: string[]) => {
		setUploadedImages(urls);
		setValue('photos', urls);
	};

	const onSubmit = async (data: RoommateFormData) => {
		if (!user) {
			toast.error('Please login to create a listing');
			router.push('/auth/login');
			return;
		}

		if (uploadedImages.length === 0) {
			toast.error('Please upload at least one photo');
			return;
		}

		createRoommateMutation.mutate(
			{
				...data,
				photos: uploadedImages
			},
			{
				onSuccess: () => {
					toast.success('Roommate listing created successfully!');
					router.push('/roommates');
				},
				onError: (error) => {
					toast.error(error.message || 'Failed to create listing. Please try again.');
				}
			}
		);
	};

	const isSubmitting = createRoommateMutation.isPending;

	// Show loading state while checking authentication
	if (isUserLoading) {
		return (
			<div className='container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	// Show login prompt if not authenticated
	if (!isAuthenticated || !user) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-amber-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Login Required</h2>
						<p className='text-muted-foreground mb-6'>
							Please log in to create a roommate listing.
						</p>
						<div className='flex justify-center gap-4'>
							<Button variant='outline' asChild>
								<Link href='/roommates'>
									Back to Roommates
								</Link>
							</Button>
							<Button asChild>
								<Link href='/auth/login?returnUrl=/roommates/new'>
									Log In
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-2xl'>
			{/* Back Button */}
			<Button variant='ghost' onClick={() => router.back()} className='mb-6'>
				<ArrowLeft className='h-4 w-4 mr-2' />
				Back
			</Button>

			{/* Header */}
			<div className='text-center mb-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className='space-y-4'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary'>
						<Users className='h-8 w-8' />
					</div>
					<h1 className='text-3xl font-bold'>Create Roommate Listing</h1>
					<p className='text-muted-foreground'>
						Find the perfect roommate for your space
					</p>
				</motion.div>
			</div>

			{/* Form */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}>
				<Card>
					<CardHeader>
						<CardTitle>Listing Details</CardTitle>
						<CardDescription>
							Tell potential roommates about your space and preferences
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
							{/* Title */}
							<div className='space-y-2'>
								<Label htmlFor='title'>Listing Title</Label>
								<Input
									id='title'
									type='text'
									placeholder='e.g., Quiet roommate needed near Ugbomro'
									{...register('title')}
									className={errors.title ? 'border-red-500' : ''}
								/>
								{errors.title && (
									<p className='text-sm text-red-500'>{errors.title.message}</p>
								)}
							</div>

							{/* Budget */}
							<div className='space-y-2'>
								<Label htmlFor='budgetMonthly'>Monthly Budget</Label>
								<Input
									id='budgetMonthly'
									type='number'
									placeholder='e.g., 25000'
									{...register('budgetMonthly', { valueAsNumber: true })}
									className={errors.budgetMonthly ? 'border-red-500' : ''}
								/>
								{errors.budgetMonthly && (
									<p className='text-sm text-red-500'>
										{errors.budgetMonthly.message}
									</p>
								)}
								<p className='text-sm text-muted-foreground'>
									The monthly rent amount you&apos;re looking for
								</p>
							</div>

							{/* Move-in Date */}
							<div className='space-y-2'>
								<Label htmlFor='moveInDate'>Move-in Date</Label>
								<Input
									id='moveInDate'
									type='date'
									{...register('moveInDate')}
									className={errors.moveInDate ? 'border-red-500' : ''}
									min={new Date().toISOString().split('T')[0]}
								/>
								{errors.moveInDate && (
									<p className='text-sm text-red-500'>
										{errors.moveInDate.message}
									</p>
								)}
							</div>

							{/* Description */}
							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									placeholder="Describe your space, what you're looking for in a roommate, house rules, etc."
									{...register('description')}
									className={errors.description ? 'border-red-500' : ''}
									rows={4}
								/>
								{errors.description && (
									<p className='text-sm text-red-500'>
										{errors.description.message}
									</p>
								)}
							</div>

							{/* Preferences */}
							<div className='space-y-4'>
								<Label className='text-base font-semibold'>
									Roommate Preferences
								</Label>

								{/* Gender */}
								<div className='space-y-2'>
									<Label htmlFor='gender'>Gender Preference</Label>
									<Select
										onValueChange={(value) =>
											setValue(
												'preferences.gender',
												value as 'male' | 'female' | 'any'
											)
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select gender preference' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='any'>Any Gender</SelectItem>
											<SelectItem value='male'>Male</SelectItem>
											<SelectItem value='female'>Female</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Cleanliness */}
								<div className='space-y-2'>
									<Label htmlFor='cleanliness'>Cleanliness Level</Label>
									<Select
										onValueChange={(value) =>
											setValue(
												'preferences.cleanliness',
												value as 'low' | 'medium' | 'high'
											)
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select cleanliness preference' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='low'>Low</SelectItem>
											<SelectItem value='medium'>Medium</SelectItem>
											<SelectItem value='high'>High</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Study Hours */}
								<div className='space-y-2'>
									<Label htmlFor='studyHours'>Study Hours Preference</Label>
									<Select
										onValueChange={(value) =>
											setValue(
												'preferences.studyHours',
												value as 'morning' | 'evening' | 'night' | 'flexible'
											)
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select study hours preference' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='morning'>Morning</SelectItem>
											<SelectItem value='evening'>Evening</SelectItem>
											<SelectItem value='night'>Night</SelectItem>
											<SelectItem value='flexible'>Flexible</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Smoking */}
								<div className='space-y-2'>
									<Label htmlFor='smoking'>Smoking Preference</Label>
									<Select
										onValueChange={(value) =>
											setValue(
												'preferences.smoking',
												value as 'no' | 'yes' | 'outdoor_only'
											)
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select smoking preference' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='no'>No Smoking</SelectItem>
											<SelectItem value='yes'>Smoking Allowed</SelectItem>
											<SelectItem value='outdoor_only'>Outdoor Only</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Pets */}
								<div className='space-y-2'>
									<Label htmlFor='pets'>Pets Preference</Label>
									<Select
										onValueChange={(value) =>
											setValue('preferences.pets', value as 'no' | 'yes')
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select pets preference' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='no'>No Pets</SelectItem>
											<SelectItem value='yes'>Pets Allowed</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Photos - Now using Cloudinary */}
							<div className='space-y-2'>
								<Label>Photos</Label>
								<ImageGalleryUpload
									value={uploadedImages}
									onChange={handleImagesChange}
									folder={UPLOAD_FOLDERS.ROOMMATES}
									maxSize={MAX_FILE_SIZES.IMAGE}
									maxImages={5}
									minImages={1}
									showCoverSelection={false}
									disabled={isSubmitting}
								/>
								{errors.photos && (
									<p className='text-sm text-red-500'>
										{errors.photos.message}
									</p>
								)}
								<p className='text-xs text-muted-foreground'>
									Upload photos of your space (max 5 images, 5MB each)
								</p>
							</div>

							{/* Submit Button */}
							<Button
								type='submit'
								className='w-full'
								size='lg'
								disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating Listing...
									</>
								) : (
									<>
										<Users className='mr-2 h-4 w-4' />
										Create Listing
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
