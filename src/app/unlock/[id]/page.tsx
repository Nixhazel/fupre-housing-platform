'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Upload,
	X,
	ArrowLeft,
	Lock,
	CheckCircle,
	Loader2,
	Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/shared/Badge';
import { useListingsStore } from '@/lib/store/listingsSlice';
import { useAuthStore } from '@/lib/store/authSlice';
import { usePaymentsStore } from '@/lib/store/paymentsSlice';
import { Listing } from '@/types';
import {
	paymentProofSchema,
	type PaymentProofFormData
} from '@/lib/validators/payments';
import { formatNaira } from '@/lib/utils/currency';
import { toast } from 'sonner';

export default function UnlockPage() {
	const params = useParams();
	const router = useRouter();
	const { getListingById } = useListingsStore();
	const { user } = useAuthStore();
	const { createPaymentProof } = usePaymentsStore();

	const [listing, setListing] = useState<Listing | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors }
	} = useForm<PaymentProofFormData>({
		resolver: zodResolver(paymentProofSchema),
		defaultValues: {
			amount: 1000
		}
	});

	watch('method');

	useEffect(() => {
		if (params.id) {
			const listingData = getListingById(params.id as string);
			if (listingData) {
				setListing(listingData);
			}
			setIsLoading(false);
		}
	}, [params.id, getListingById]);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				toast.error('Image size must be less than 5MB');
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				setUploadedImage(result);
				setValue('imageUrl', result);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setUploadedImage(null);
		setValue('imageUrl', '');
	};

	const onSubmit = async (data: PaymentProofFormData) => {
		if (!user || !listing) return;

		setIsSubmitting(true);
		try {
			await createPaymentProof({
				...data,
				listingId: listing.id,
				userId: user.id
			});

			toast.success('Payment proof submitted successfully!');
			router.push(`/listings/${listing.id}`);
		} catch {
			toast.error('Failed to submit payment proof. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<div className='animate-pulse space-y-8'>
					<div className='h-8 bg-muted rounded w-1/3'></div>
					<div className='h-64 bg-muted rounded'></div>
				</div>
			</div>
		);
	}

	if (!listing) {
		return (
			<div className='container mx-auto px-4 py-8 text-center'>
				<h1 className='text-2xl font-bold mb-4'>Listing Not Found</h1>
				<p className='text-muted-foreground mb-6'>
					The listing you&apos;re trying to unlock doesn&apos;t exist.
				</p>
				<Button onClick={() => router.push('/listings')}>
					Browse All Listings
				</Button>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-2xl'>
			{/* Back Button */}
			<Button variant='ghost' onClick={() => router.back()} className='mb-6'>
				<ArrowLeft className='h-4 w-4 mr-2' />
				Back to Listing
			</Button>

			{/* Header */}
			<div className='text-center mb-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className='space-y-4'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary'>
						<Lock className='h-8 w-8' />
					</div>
					<h1 className='text-3xl font-bold'>Unlock Location</h1>
					<p className='text-muted-foreground'>
						Upload payment proof to unlock the exact location and contact
						details
					</p>
				</motion.div>
			</div>

			{/* Listing Preview */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className='mb-8'>
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center space-x-4'>
							<img
								src={listing.coverPhoto}
								alt={listing.title}
								className='w-16 h-16 rounded-lg object-cover'
							/>
							<div className='flex-1'>
								<h3 className='font-semibold'>{listing.title}</h3>
								<p className='text-sm text-muted-foreground'>
									{listing.campusArea}
								</p>
								<div className='flex items-center space-x-2 mt-1'>
									<Badge variant='outline'>{listing.bedrooms} bed</Badge>
									<Badge variant='outline'>{listing.bathrooms} bath</Badge>
								</div>
							</div>
							<div className='text-right'>
								<div className='text-lg font-bold text-primary'>
									{formatNaira(listing.priceMonthly)}/month
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Payment Form */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.4 }}>
				<Card>
					<CardHeader>
						<CardTitle>Payment Details</CardTitle>
						<CardDescription>
							Upload proof of payment to unlock location details
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
							{/* Amount */}
							<div className='space-y-2'>
								<Label htmlFor='amount'>Amount</Label>
								<Input
									id='amount'
									type='number'
									value={1000}
									readOnly
									className='bg-muted'
								/>
								<p className='text-sm text-muted-foreground'>
									Standard unlock fee for location details
								</p>
							</div>

							{/* Payment Method */}
							<div className='space-y-2'>
								<Label htmlFor='method'>Payment Method</Label>
								<Select
									onValueChange={(value) =>
										setValue(
											'method',
											value as 'bank_transfer' | 'ussd' | 'pos'
										)
									}>
									<SelectTrigger
										className={errors.method ? 'border-red-500' : ''}>
										<SelectValue placeholder='Select payment method' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
										<SelectItem value='ussd'>USSD</SelectItem>
										<SelectItem value='pos'>POS</SelectItem>
									</SelectContent>
								</Select>
								{errors.method && (
									<p className='text-sm text-red-500'>
										{errors.method.message}
									</p>
								)}
							</div>

							{/* Reference */}
							<div className='space-y-2'>
								<Label htmlFor='reference'>Transaction Reference</Label>
								<Input
									id='reference'
									type='text'
									placeholder='Enter transaction reference'
									{...register('reference')}
									className={errors.reference ? 'border-red-500' : ''}
								/>
								{errors.reference && (
									<p className='text-sm text-red-500'>
										{errors.reference.message}
									</p>
								)}
								<p className='text-sm text-muted-foreground'>
									Enter the reference number from your payment
								</p>
							</div>

							{/* Image Upload */}
							<div className='space-y-2'>
								<Label>Payment Receipt</Label>
								{!uploadedImage ? (
									<div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center'>
										<Upload className='h-8 w-8 mx-auto mb-4 text-muted-foreground' />
										<p className='text-sm text-muted-foreground mb-2'>
											Upload a screenshot of your payment receipt
										</p>
										<input
											type='file'
											accept='image/*'
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
											Choose File
										</Button>
										<p className='text-xs text-muted-foreground mt-2'>
											PNG, JPG up to 5MB
										</p>
									</div>
								) : (
									<div className='relative'>
										<img
											src={uploadedImage}
											alt='Payment receipt'
											className='w-full h-48 object-cover rounded-lg'
										/>
										<Button
											type='button'
											variant='destructive'
											size='sm'
											className='absolute top-2 right-2'
											onClick={removeImage}>
											<X className='h-4 w-4' />
										</Button>
									</div>
								)}
								{errors.imageUrl && (
									<p className='text-sm text-red-500'>
										{errors.imageUrl.message}
									</p>
								)}
							</div>

							{/* Submit Button */}
							<Button
								type='submit'
								className='w-full'
								size='lg'
								disabled={isSubmitting || !uploadedImage}>
								{isSubmitting ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Submitting...
									</>
								) : (
									<>
										<CheckCircle className='mr-2 h-4 w-4' />
										Submit Payment Proof
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</motion.div>

			{/* Information */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.6 }}
				className='mt-8'>
				<Card>
					<CardContent className='p-6'>
						<div className='flex items-start space-x-3'>
							<Building2 className='h-5 w-5 text-primary mt-0.5' />
							<div>
								<h4 className='font-semibold mb-2'>What happens next?</h4>
								<ul className='text-sm text-muted-foreground space-y-1'>
									<li>
										• Your payment proof will be reviewed by our admin team
									</li>
									<li>
										• You&apos;ll receive a notification once approved (usually
										within 24 hours)
									</li>
									<li>
										• Once approved, you&apos;ll have access to the full address
										and contact details
									</li>
									<li>
										• You can contact the agent directly to arrange a viewing
									</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
