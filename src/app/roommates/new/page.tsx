'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, ArrowLeft, Users, Loader2, Plus } from 'lucide-react';
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
import { useAuthStore } from '@/lib/store/authSlice';
import { useRoommatesStore } from '@/lib/store/roommatesSlice';
import {
	roommateSchema,
	type RoommateFormData
} from '@/lib/validators/roommates';
import { toast } from 'sonner';

export default function NewRoommatePage() {
	const router = useRouter();
	const { user } = useAuthStore();
	const { createRoommateListing } = useRoommatesStore();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm<RoommateFormData>({
		resolver: zodResolver(roommateSchema)
	});

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const newImages: string[] = [];

			Array.from(files).forEach((file) => {
				if (file.size > 5 * 1024 * 1024) {
					// 5MB limit
					toast.error('Image size must be less than 5MB');
					return;
				}

				const reader = new FileReader();
				reader.onload = (e) => {
					const result = e.target?.result as string;
					newImages.push(result);

					if (newImages.length === files.length) {
						const updatedImages = [...uploadedImages, ...newImages];
						if (updatedImages.length > 5) {
							toast.error('Maximum 5 images allowed');
							return;
						}
						setUploadedImages(updatedImages);
						setValue('photos', updatedImages);
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const removeImage = (index: number) => {
		const updatedImages = uploadedImages.filter((_, i) => i !== index);
		setUploadedImages(updatedImages);
		setValue('photos', updatedImages);
	};

	const onSubmit = async (data: RoommateFormData) => {
		if (!user) {
			toast.error('Please login to create a listing');
			router.push('/auth/login');
			return;
		}

		setIsSubmitting(true);
		try {
			await createRoommateListing({
				...data,
				ownerId: user.id,
				ownerType: user.role === 'owner' ? 'owner' : 'student'
			});

			toast.success('Roommate listing created successfully!');
			router.push('/roommates');
		} catch {
			toast.error('Failed to create listing. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

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

							{/* Photos */}
							<div className='space-y-2'>
								<Label>Photos</Label>
								{uploadedImages.length === 0 ? (
									<div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center'>
										<Upload className='h-8 w-8 mx-auto mb-4 text-muted-foreground' />
										<p className='text-sm text-muted-foreground mb-2'>
											Upload photos of your space
										</p>
										<input
											type='file'
											accept='image/*'
											multiple
											onChange={handleImageUpload}
											className='hidden'
											id='image-upload'
										/>
										<Button
											type='button'
											variant='outline'
											onClick={() =>
												document.getElementById('image-upload')?.click()
											}>
											Choose Files
										</Button>
										<p className='text-xs text-muted-foreground mt-2'>
											PNG, JPG up to 5MB each (max 5 images)
										</p>
									</div>
								) : (
									<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
										{uploadedImages.map((image, index) => (
											<div key={index} className='relative h-32'>
												<Image
													src={image}
													alt={`Upload ${index + 1}`}
													fill
													sizes="(max-width: 768px) 50vw, 33vw"
													className='object-cover rounded-lg'
												/>
												<Button
													type='button'
													variant='destructive'
													size='sm'
													className='absolute top-2 right-2'
													onClick={() => removeImage(index)}>
													<X className='h-4 w-4' />
												</Button>
											</div>
										))}
										{uploadedImages.length < 5 && (
											<div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center flex items-center justify-center'>
												<input
													type='file'
													accept='image/*'
													multiple
													onChange={handleImageUpload}
													className='hidden'
													id='image-upload-more'
												/>
												<Button
													type='button'
													variant='outline'
													size='sm'
													onClick={() =>
														document
															.getElementById('image-upload-more')
															?.click()
													}>
													<Plus className='h-4 w-4' />
												</Button>
											</div>
										)}
									</div>
								)}
								{errors.photos && (
									<p className='text-sm text-red-500'>
										{errors.photos.message}
									</p>
								)}
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
