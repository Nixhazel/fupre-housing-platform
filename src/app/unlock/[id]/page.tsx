'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowLeft,
	Lock,
	CheckCircle,
	Loader2,
	Building2,
	AlertCircle,
	ShieldAlert,
	ShieldCheck
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
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useListing } from '@/hooks/api/useListings';
import { useCurrentUser } from '@/hooks/api/useAuth';
import {
	useSubmitPaymentProof,
	useUnlockStatus
} from '@/hooks/api/usePayments';
import {
	paymentProofSchema,
	type PaymentProofFormData
} from '@/lib/validators/payments';
import { formatNaira } from '@/lib/utils/currency';
import { PLATFORM_CONFIG } from '@/lib/config/env';
import { toast } from 'sonner';
import { UPLOAD_FOLDERS, MAX_FILE_SIZES } from '@/lib/cloudinary';
import Link from 'next/link';

export default function UnlockPage() {
	const params = useParams();
	const router = useRouter();
	const listingId = params.id as string;

	// TanStack Query hooks
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const {
		data: listingData,
		isLoading: isListingLoading,
		isError: isListingError
	} = useListing(listingId);
	const { data: unlockStatus } = useUnlockStatus(listingId);
	const submitProofMutation = useSubmitPaymentProof();

	// Local state for image URL
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

	const listing = listingData?.listing;
	const isLoading = isListingLoading || isUserLoading;
	const isAlreadyUnlocked = unlockStatus?.isUnlocked;

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors }
	} = useForm<PaymentProofFormData>({
		resolver: zodResolver(paymentProofSchema),
		defaultValues: {
			amount: PLATFORM_CONFIG.UNLOCK_FEE
		}
	});

	watch('method');

	// Handle image upload success from Cloudinary
	const handleImageUploaded = (url: string) => {
		setUploadedImageUrl(url);
		setValue('imageUrl', url);
	};

	// Handle image removal
	const handleImageRemove = () => {
		setUploadedImageUrl('');
		setValue('imageUrl', '');
	};

	const onSubmit = async (data: PaymentProofFormData) => {
		if (!user || !listing) {
			toast.error('Please log in to submit payment proof');
			return;
		}

		if (!uploadedImageUrl) {
			toast.error('Please upload a payment receipt');
			return;
		}

		submitProofMutation.mutate(
			{
				listingId: listing.id,
				amount: data.amount,
				method: data.method,
				reference: data.reference,
				imageUrl: uploadedImageUrl
			},
			{
				onSuccess: () => {
					toast.success(
						'Payment proof submitted successfully! We will review it shortly.'
					);
					router.push(`/listings/${listing.id}`);
				},
				onError: (error) => {
					toast.error(
						error.message || 'Failed to submit payment proof. Please try again.'
					);
				}
			}
		);
	};

	const isSubmitting = submitProofMutation.isPending;

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

	if (isListingError || !listing) {
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

	// Check if already unlocked
	if (isAlreadyUnlocked) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-2xl'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Already Unlocked!</h2>
						<p className='text-muted-foreground mb-6'>
							You already have access to this listing&apos;s location details.
						</p>
						<Button asChild>
							<Link href={`/listings/${listing.id}`}>View Listing Details</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Check if user is logged in
	if (!user) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-2xl'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-amber-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Login Required</h2>
						<p className='text-muted-foreground mb-6'>
							Please log in to unlock this listing&apos;s location details.
						</p>
						<div className='flex justify-center gap-4'>
							<Button variant='outline' asChild>
								<Link href={`/listings/${listing.id}`}>Back to Listing</Link>
							</Button>
							<Button asChild>
								<Link href={`/auth/login?returnUrl=/unlock/${listing.id}`}>
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
							<div className='relative w-16 h-16 shrink-0'>
								<Image
									src={listing.coverPhoto}
									alt={listing.title}
									fill
									sizes='64px'
									className='rounded-lg object-cover'
								/>
							</div>
							<div className='flex-1'>
								<h3 className='font-semibold'>{listing.title}</h3>
								<p className='text-sm text-muted-foreground'>
									{listing.location}
								</p>
								<div className='flex items-center space-x-2 mt-1'>
									<Badge variant='outline'>{listing.bedrooms} bed</Badge>
									<Badge variant='outline'>{listing.bathrooms} bath</Badge>
									{listing.agent?.isVerified && (
										<Badge
											variant='success'
											className='flex items-center gap-1'>
											<ShieldCheck className='h-3 w-3' />
											Verified Agent
										</Badge>
									)}
								</div>
							</div>
							<div className='text-right'>
								<div className='text-lg font-bold text-primary'>
									{formatNaira(listing.priceYearly)}/yr
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Unverified Agent Warning */}
			{listing.agent && !listing.agent.isVerified && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className='mb-8'>
					<Card className='border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800'>
						<CardContent className='p-4'>
							<div className='flex items-start gap-3'>
								<ShieldAlert className='h-5 w-5 text-amber-600 mt-0.5 shrink-0' />
								<div>
									<h4 className='font-semibold text-amber-800 dark:text-amber-200'>
										Unverified Agent
									</h4>
									<p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
										This listing is from an agent who has not yet been verified
										by our team. While many unverified agents are legitimate, we
										recommend extra caution:
									</p>
									<ul className='text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1'>
										<li>
											• Verify the property exists before making any additional
											payments
										</li>
										<li>
											• Visit the property in person before signing any
											agreements
										</li>
										<li>
											• Never pay rent in advance without seeing the property
										</li>
									</ul>
									<p className='text-xs text-amber-600 dark:text-amber-400 mt-3'>
										Verified agents have been vetted by EasyVille Estates for
										added trust and security.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

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
									value={PLATFORM_CONFIG.UNLOCK_FEE}
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

							{/* Image Upload - Now using Cloudinary */}
							<div className='space-y-2'>
								<Label>Payment Receipt</Label>
								<ImageUpload
									value={uploadedImageUrl}
									onChange={handleImageUploaded}
									onRemove={handleImageRemove}
									onError={(error) => toast.error(error)}
									folder={UPLOAD_FOLDERS.PAYMENT_PROOFS}
									maxSize={MAX_FILE_SIZES.PAYMENT_PROOF}
									placeholder='Upload your payment receipt'
									aspectRatio='4/3'
									showInstructions
								/>
								{errors.imageUrl && (
									<p className='text-sm text-red-500'>
										{errors.imageUrl.message}
									</p>
								)}
								<p className='text-xs text-muted-foreground'>
									Upload a clear screenshot or photo of your payment receipt
								</p>
							</div>

							{/* Submit Button */}
							<Button
								type='submit'
								className='w-full'
								size='lg'
								disabled={isSubmitting || !uploadedImageUrl}>
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
