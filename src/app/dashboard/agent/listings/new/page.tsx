'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowLeft,
	Home,
	Loader2,
	AlertCircle,
	MapPin,
	DollarSign,
	Bed,
	Bath,
	Ruler,
	Image as ImageIcon,
	Map,
	Video
} from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ImageGalleryUpload } from '@/components/ui/ImageGalleryUpload';
import { VideoGalleryUpload } from '@/components/ui/VideoGalleryUpload';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCreateListing } from '@/hooks/api/useAgent';
import {
	listingFormSchema,
	type ListingFormData,
	AMENITIES_OPTIONS,
	PROPERTY_TYPES,
	AVAILABILITY_STATUSES,
	getLocationsForUniversity
} from '@/lib/validators/listings';
import { UNIVERSITIES, getUniversityDisplayName } from '@/lib/config/universities';
import { toast } from 'sonner';
import { UPLOAD_FOLDERS, MAX_FILE_SIZES } from '@/lib/cloudinary';
import Link from 'next/link';

export default function NewListingPage() {
	const router = useRouter();

	// Auth check
	const { user, isLoading: isUserLoading, isAuthenticated } = useAuth();
	const isAgent = user?.role === 'agent' || user?.role === 'admin';

	// Mutation hook
	const createListingMutation = useCreateListing();

	// Local state for images/videos
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
	const [coverImage, setCoverImage] = useState<string>('');
	const [selectedAmenities, setSelectedAmenities] = useState<ListingFormData['amenities']>([]);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors }
	} = useForm<ListingFormData>({
		resolver: zodResolver(listingFormSchema) as never,
		defaultValues: {
			amenities: [] as ListingFormData['amenities'],
			photos: [] as ListingFormData['photos'],
			videos: [] as string[],
			coverPhoto: '',
			mapPreview: '',
			mapFull: '',
			availabilityStatus: 'available_now',
			bedrooms: 1,
			bathrooms: 1
		}
	});

	// Watch values for controlled inputs
	const universityValue = watch('university');
	const locationValue = watch('location');
	const propertyTypeValue = watch('propertyType');
	const availabilityStatusValue = watch('availabilityStatus');

	// Get available locations based on selected university
	const availableLocations = universityValue
		? getLocationsForUniversity(universityValue)
		: [];

	// Handle video upload
	const handleVideosChange = (urls: string[]) => {
		setUploadedVideos(urls);
		setValue('videos', urls);
	};

	// Handle image upload
	const handleImagesChange = (urls: string[]) => {
		setUploadedImages(urls);
		setValue('photos', urls);

		// If no cover is set yet, use first image
		if (urls.length > 0 && !coverImage) {
			setCoverImage(urls[0]);
			setValue('coverPhoto', urls[0]);
		}
	};

	// Handle cover image change
	const handleCoverChange = (url: string) => {
		setCoverImage(url);
		setValue('coverPhoto', url);
	};

	// Handle amenity toggle
	const handleAmenityToggle = (amenity: ListingFormData['amenities'][number], checked: boolean) => {
		const updated = checked
			? [...selectedAmenities, amenity]
			: selectedAmenities.filter((a) => a !== amenity);
		setSelectedAmenities(updated);
		setValue('amenities', updated);
	};

	const onSubmit = async (data: ListingFormData) => {
		if (!user) {
			toast.error('Please login to create a listing');
			router.push('/auth/login');
			return;
		}

		if (uploadedImages.length === 0) {
			toast.error('Please upload at least one photo');
			return;
		}

		if (!coverImage) {
			toast.error('Please select a cover image');
			return;
		}

		if (selectedAmenities.length === 0) {
			toast.error('Please select at least one amenity');
			return;
		}

		createListingMutation.mutate(
			{
				...data,
				photos: uploadedImages,
				videos: uploadedVideos,
				coverPhoto: coverImage,
				amenities: selectedAmenities
			},
			{
				onSuccess: () => {
					toast.success('Listing created successfully!');
					router.push('/dashboard/agent/listings');
				},
				onError: (error) => {
					toast.error(
						error.message || 'Failed to create listing. Please try again.'
					);
				}
			}
		);
	};

	const isSubmitting = createListingMutation.isPending;

	// Loading state
	if (isUserLoading) {
		return (
			<div className='container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	// Not authenticated
	if (!isAuthenticated || !user) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-amber-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Login Required</h2>
						<p className='text-muted-foreground mb-6'>
							Please log in to create a listing.
						</p>
						<div className='flex justify-center gap-4'>
							<Button variant='outline' asChild>
								<Link href='/dashboard/agent/listings'>Back to Listings</Link>
							</Button>
							<Button asChild>
								<Link href='/auth/login?returnUrl=/dashboard/agent/listings/new'>
									Log In
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Not an agent
	if (!isAgent) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
						<p className='text-muted-foreground mb-6'>
							Only agents can create property listings.
						</p>
						<Button asChild>
							<Link href='/'>Go Home</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			{/* Back Button */}
			<Button
				variant='ghost'
				onClick={() => router.push('/dashboard/agent/listings')}
				className='mb-6'>
				<ArrowLeft className='h-4 w-4 mr-2' />
				Back to Listings
			</Button>

			{/* Header */}
			<div className='text-center mb-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className='space-y-4'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary'>
						<Home className='h-8 w-8' />
					</div>
					<h1 className='text-3xl font-bold'>Create New Listing</h1>
					<p className='text-muted-foreground'>
						Add a new property to your listings
					</p>
				</motion.div>
			</div>

			{/* Form */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
					{/* Basic Info Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Home className='h-5 w-5' />
								Basic Information
							</CardTitle>
							<CardDescription>
								Enter the basic details of your property
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Title */}
							<div className='space-y-2'>
								<Label htmlFor='title'>Listing Title *</Label>
								<Input
									id='title'
									type='text'
									placeholder='e.g., Spacious 2-Bedroom Apartment near Ugbomro'
									{...register('title')}
									className={errors.title ? 'border-red-500' : ''}
								/>
								{errors.title && (
									<p className='text-sm text-red-500'>{errors.title.message}</p>
								)}
							</div>

							{/* Description */}
							<div className='space-y-2'>
								<Label htmlFor='description'>Description *</Label>
								<Textarea
									id='description'
									placeholder='Describe your property in detail. Include features, nearby amenities, transport options, etc.'
									{...register('description')}
									className={errors.description ? 'border-red-500' : ''}
									rows={5}
								/>
								{errors.description && (
									<p className='text-sm text-red-500'>
										{errors.description.message}
									</p>
								)}
							</div>

							{/* University */}
							<div className='space-y-2'>
								<Label htmlFor='university'>University *</Label>
								<Select
									value={universityValue}
									onValueChange={(value) => {
										setValue('university', value as ListingFormData['university']);
										setValue('location', ''); // Reset location when university changes
									}}>
									<SelectTrigger
										className={errors.university ? 'border-red-500' : ''}>
										<SelectValue placeholder='Select university' />
									</SelectTrigger>
									<SelectContent>
										{UNIVERSITIES.map((uni) => (
											<SelectItem key={uni.id} value={uni.id}>
												{uni.shortName} - {uni.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.university && (
									<p className='text-sm text-red-500'>
										{errors.university.message}
									</p>
								)}
							</div>

							{/* Location */}
							<div className='space-y-2'>
								<Label htmlFor='location'>Location *</Label>
								<Select
									value={locationValue}
									onValueChange={(value) =>
										setValue('location', value)
									}
									disabled={!universityValue}>
									<SelectTrigger
										className={errors.location ? 'border-red-500' : ''}>
										<SelectValue placeholder={universityValue ? 'Select location' : 'Select university first'} />
									</SelectTrigger>
									<SelectContent>
										{availableLocations.map((location) => (
											<SelectItem key={location} value={location}>
												{location}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.location && (
									<p className='text-sm text-red-500'>
										{errors.location.message}
									</p>
								)}
								{universityValue && (
									<p className='text-xs text-muted-foreground'>
										Locations near {getUniversityDisplayName(universityValue)}
									</p>
								)}
							</div>

							{/* Property Type */}
							<div className='space-y-2'>
								<Label htmlFor='propertyType'>Property Type *</Label>
								<Select
									value={propertyTypeValue}
									onValueChange={(value) =>
										setValue('propertyType', value as ListingFormData['propertyType'])
									}>
									<SelectTrigger
										className={errors.propertyType ? 'border-red-500' : ''}>
										<SelectValue placeholder='Select property type' />
									</SelectTrigger>
									<SelectContent>
										{PROPERTY_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{type === 'bedsitter' ? 'Bedsitter' : 
												 type === 'self-con' ? 'Self-Contained' : 
												 type.charAt(0).toUpperCase() + type.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.propertyType && (
									<p className='text-sm text-red-500'>
										{errors.propertyType.message}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Location Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<MapPin className='h-5 w-5' />
								Location Details
							</CardTitle>
							<CardDescription>
								Provide address information (full address is revealed after
								booking inspection)
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Approximate Address */}
							<div className='space-y-2'>
								<Label htmlFor='addressApprox'>
									Approximate Address (Public) *
								</Label>
								<Input
									id='addressApprox'
									type='text'
									placeholder='e.g., Off Campus Road, Ugbomro'
									{...register('addressApprox')}
									className={errors.addressApprox ? 'border-red-500' : ''}
								/>
								<p className='text-xs text-muted-foreground'>
									This will be shown to all users before they book an inspection
								</p>
								{errors.addressApprox && (
									<p className='text-sm text-red-500'>
										{errors.addressApprox.message}
									</p>
								)}
							</div>

							{/* Full Address */}
							<div className='space-y-2'>
								<Label htmlFor='addressFull'>Full Address (Private) *</Label>
								<Input
									id='addressFull'
									type='text'
									placeholder='e.g., House 12, Behind GTBank, Off Campus Road, Ugbomro'
									{...register('addressFull')}
									className={errors.addressFull ? 'border-red-500' : ''}
								/>
								<p className='text-xs text-muted-foreground'>
									This will only be shown after a student books an inspection
								</p>
								{errors.addressFull && (
									<p className='text-sm text-red-500'>
										{errors.addressFull.message}
									</p>
								)}
							</div>

							{/* Walking Time to Campus */}
							<div className='space-y-2'>
								<Label htmlFor='walkingMinutes'>
									<Ruler className='h-4 w-4 inline mr-1' />
									Walking Time to Campus (minutes) *
								</Label>
								<Input
									id='walkingMinutes'
									type='number'
									min='1'
									max='120'
									placeholder='e.g., 15'
									{...register('walkingMinutes', { valueAsNumber: true })}
									className={errors.walkingMinutes ? 'border-red-500' : ''}
								/>
								<p className='text-xs text-muted-foreground'>
									How long does it take to walk from this property to campus?
								</p>
								{errors.walkingMinutes && (
									<p className='text-sm text-red-500'>
										{errors.walkingMinutes.message}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Pricing & Details Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<DollarSign className='h-5 w-5' />
								Pricing & Property Details
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
								{/* Price */}
								<div className='space-y-2'>
									<Label htmlFor='priceYearly'>Yearly Rent (₦) *</Label>
									<Input
										id='priceYearly'
										type='number'
										placeholder='e.g., 50000'
										{...register('priceYearly', { valueAsNumber: true })}
										className={errors.priceYearly ? 'border-red-500' : ''}
									/>
									{errors.priceYearly && (
										<p className='text-sm text-red-500'>
											{errors.priceYearly.message}
										</p>
									)}
								</div>

								{/* Bedrooms */}
								<div className='space-y-2'>
									<Label htmlFor='bedrooms'>
										<Bed className='h-4 w-4 inline mr-1' />
										Bedrooms *
									</Label>
									<Input
										id='bedrooms'
										type='number'
										min='0'
										max='5'
										placeholder='e.g., 2 (0 for bedsitter/self-con)'
										{...register('bedrooms', { valueAsNumber: true })}
										className={errors.bedrooms ? 'border-red-500' : ''}
									/>
									<p className='text-xs text-muted-foreground'>
										Use 0 for bedsitter or self-contained
									</p>
									{errors.bedrooms && (
										<p className='text-sm text-red-500'>
											{errors.bedrooms.message}
										</p>
									)}
								</div>

								{/* Bathrooms */}
								<div className='space-y-2'>
									<Label htmlFor='bathrooms'>
										<Bath className='h-4 w-4 inline mr-1' />
										Bathrooms *
									</Label>
									<Input
										id='bathrooms'
										type='number'
										min='1'
										max='4'
										placeholder='e.g., 1'
										{...register('bathrooms', { valueAsNumber: true })}
										className={errors.bathrooms ? 'border-red-500' : ''}
									/>
									{errors.bathrooms && (
										<p className='text-sm text-red-500'>
											{errors.bathrooms.message}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Amenities Card */}
					<Card>
						<CardHeader>
							<CardTitle>Amenities *</CardTitle>
							<CardDescription>
								Select all amenities available at this property (min 1, max 13)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
								{AMENITIES_OPTIONS.map((amenity) => (
									<div key={amenity} className='flex items-center space-x-2'>
										<Checkbox
											id={`amenity-${amenity}`}
											checked={selectedAmenities.includes(amenity)}
											onCheckedChange={(checked) =>
												handleAmenityToggle(amenity, checked as boolean)
											}
											disabled={
												!selectedAmenities.includes(amenity) &&
												selectedAmenities.length >= 13
											}
										/>
										<Label
											htmlFor={`amenity-${amenity}`}
											className='text-sm cursor-pointer'>
											{amenity}
										</Label>
									</div>
								))}
							</div>
							{errors.amenities && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.amenities.message}
								</p>
							)}
							<p className='text-xs text-muted-foreground mt-3'>
								Selected: {selectedAmenities.length}/13
							</p>
						</CardContent>
					</Card>

					{/* Availability Card */}
					<Card>
						<CardHeader>
							<CardTitle>Availability *</CardTitle>
							<CardDescription>
								When is this property available?
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='space-y-2'>
								<Label htmlFor='availabilityStatus'>Availability Status *</Label>
								<Select
									value={availabilityStatusValue}
									onValueChange={(value) =>
										setValue('availabilityStatus', value as ListingFormData['availabilityStatus'])
									}>
									<SelectTrigger
										className={errors.availabilityStatus ? 'border-red-500' : ''}>
										<SelectValue placeholder='Select availability' />
									</SelectTrigger>
									<SelectContent>
										{AVAILABILITY_STATUSES.map((status) => (
											<SelectItem key={status} value={status}>
												{status === 'available_now' ? 'Available Now' : 'Available Soon'}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.availabilityStatus && (
									<p className='text-sm text-red-500'>
										{errors.availabilityStatus.message}
									</p>
								)}
							</div>

							{availabilityStatusValue === 'available_soon' && (
								<div className='space-y-2'>
									<Label htmlFor='availableFrom'>Available From *</Label>
									<Input
										id='availableFrom'
										type='date'
										min={new Date().toISOString().split('T')[0]}
										{...register('availableFrom')}
										className={errors.availableFrom ? 'border-red-500' : ''}
									/>
									<p className='text-xs text-muted-foreground'>
										When will this property become available?
									</p>
									{errors.availableFrom && (
										<p className='text-sm text-red-500'>
											{errors.availableFrom.message}
										</p>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Landlord/Caretaker Contact Card */}
					<Card>
						<CardHeader>
							<CardTitle>Landlord/Caretaker Contact</CardTitle>
							<CardDescription>
								Provide the landlord or caretaker details. This information will only be revealed after a student books an inspection.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='space-y-2'>
								<Label htmlFor='landlordName'>Landlord/Caretaker Name</Label>
								<Input
									id='landlordName'
									type='text'
									placeholder='e.g., Mr. Johnson'
									{...register('landlordName')}
									className={errors.landlordName ? 'border-red-500' : ''}
								/>
								{errors.landlordName && (
									<p className='text-sm text-red-500'>
										{errors.landlordName.message}
									</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='landlordPhone'>Landlord/Caretaker Phone</Label>
								<Input
									id='landlordPhone'
									type='tel'
									placeholder='+234XXXXXXXXXX'
									{...register('landlordPhone')}
									className={errors.landlordPhone ? 'border-red-500' : ''}
								/>
								<p className='text-xs text-muted-foreground'>
									Nigerian phone number format (+234XXXXXXXXXX)
								</p>
								{errors.landlordPhone && (
									<p className='text-sm text-red-500'>
										{errors.landlordPhone.message}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Photos Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<ImageIcon className='h-5 w-5' />
								Property Photos *
							</CardTitle>
							<CardDescription>
								Upload high-quality photos of your property (1-10 images, max
								5MB each)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ImageGalleryUpload
								value={uploadedImages}
								onChange={handleImagesChange}
								onCoverChange={handleCoverChange}
								coverImage={coverImage}
								folder={UPLOAD_FOLDERS.LISTINGS}
								maxSize={MAX_FILE_SIZES.IMAGE}
								maxImages={10}
								minImages={1}
								showCoverSelection={true}
								disabled={isSubmitting}
							/>
							{errors.photos && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.photos.message}
								</p>
							)}
							{errors.coverPhoto && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.coverPhoto.message}
								</p>
							)}
						</CardContent>
					</Card>

					{/* Videos Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Video className='h-5 w-5' />
								Property Videos (Optional)
							</CardTitle>
							<CardDescription>
								Upload walkthrough videos of your property (up to 3 videos, max
								100MB each). Supported formats: MP4, WebM, MOV, AVI
							</CardDescription>
						</CardHeader>
						<CardContent>
							<VideoGalleryUpload
								value={uploadedVideos}
								onChange={handleVideosChange}
								folder={UPLOAD_FOLDERS.LISTING_VIDEOS}
								maxSize={MAX_FILE_SIZES.VIDEO}
								maxVideos={3}
								disabled={isSubmitting}
							/>
							{errors.videos && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.videos.message}
								</p>
							)}
						</CardContent>
					</Card>

					{/* Map URLs Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Map className='h-5 w-5' />
								Map Location
							</CardTitle>
							<CardDescription>
								Provide Google Maps embed URLs or screenshot URLs for the
								location
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Map Preview URL */}
							<div className='space-y-2'>
								<Label htmlFor='mapPreview'>Map Preview URL (Public) *</Label>
								<Input
									id='mapPreview'
									type='url'
									placeholder='https://maps.google.com/... or image URL'
									{...register('mapPreview')}
									className={errors.mapPreview ? 'border-red-500' : ''}
								/>
								<p className='text-xs text-muted-foreground'>
									A blurred/zoomed-out map shown before booking. Can be a Google
									Maps embed URL or an image URL.
								</p>
								{errors.mapPreview && (
									<p className='text-sm text-red-500'>
										{errors.mapPreview.message}
									</p>
								)}
							</div>

							{/* Full Map URL */}
							<div className='space-y-2'>
								<Label htmlFor='mapFull'>Full Map URL (Private) *</Label>
								<Input
									id='mapFull'
									type='url'
									placeholder='https://maps.google.com/... or image URL'
									{...register('mapFull')}
									className={errors.mapFull ? 'border-red-500' : ''}
								/>
								<p className='text-xs text-muted-foreground'>
									The detailed map shown after booking inspection. Should include exact
									location.
								</p>
								{errors.mapFull && (
									<p className='text-sm text-red-500'>
										{errors.mapFull.message}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className='flex justify-end gap-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => router.push('/dashboard/agent/listings')}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type='submit' size='lg' disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Creating Listing...
								</>
							) : (
								<>
									<Home className='mr-2 h-4 w-4' />
									Create Listing
								</>
							)}
						</Button>
					</div>
				</form>
			</motion.div>
		</div>
	);
}
