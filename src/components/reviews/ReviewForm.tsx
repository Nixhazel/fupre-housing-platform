'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import {
	createReviewSchema,
	type CreateReviewFormData
} from '@/lib/validators/reviews';
import {
	useCreateReview,
	useUpdateReview,
	useDeleteReview,
	type Review
} from '@/hooks/api/useReviews';
import { toast } from 'sonner';

interface ReviewFormProps {
	listingId: string;
	existingReview?: Review | null;
	canReview: boolean;
	hasReviewed: boolean;
	onSuccess?: () => void;
}

export function ReviewForm({
	listingId,
	existingReview,
	canReview,
	hasReviewed,
	onSuccess
}: ReviewFormProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const createMutation = useCreateReview(listingId);
	const updateMutation = useUpdateReview(listingId, existingReview?.id || '');
	const deleteMutation = useDeleteReview(listingId, existingReview?.id || '');

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors }
	} = useForm<CreateReviewFormData>({
		resolver: zodResolver(createReviewSchema),
		defaultValues: {
			rating: existingReview?.rating || 0,
			comment: existingReview?.comment || ''
		}
	});

	const rating = watch('rating');

	const onSubmit = async (data: CreateReviewFormData) => {
		try {
			if (existingReview && isEditing) {
				await updateMutation.mutateAsync(data);
				toast.success('Review updated successfully');
				setIsEditing(false);
			} else {
				await createMutation.mutateAsync(data);
				toast.success('Review submitted successfully');
				reset();
			}
			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to submit review'
			);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync();
			toast.success('Review deleted successfully');
			setShowDeleteConfirm(false);
			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete review'
			);
		}
	};

	// Show existing review in read mode
	if (existingReview && !isEditing) {
		return (
			<Card>
				<CardHeader className='pb-2'>
					<div className='flex items-center justify-between'>
						<CardTitle className='text-lg'>Your Review</CardTitle>
						<div className='flex gap-2'>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setIsEditing(true)}
							>
								<Edit2 className='h-4 w-4 mr-1' />
								Edit
							</Button>
							{showDeleteConfirm ? (
								<div className='flex gap-2'>
									<Button
										variant='destructive'
										size='sm'
										onClick={handleDelete}
										disabled={deleteMutation.isPending}
									>
										{deleteMutation.isPending ? (
											<Loader2 className='h-4 w-4 animate-spin' />
										) : (
											'Confirm'
										)}
									</Button>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setShowDeleteConfirm(false)}
									>
										Cancel
									</Button>
								</div>
							) : (
								<Button
									variant='ghost'
									size='sm'
									onClick={() => setShowDeleteConfirm(true)}
								>
									<X className='h-4 w-4 mr-1' />
									Delete
								</Button>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<StarRating value={existingReview.rating} readonly size='md' />
					<p className='mt-3 text-muted-foreground'>{existingReview.comment}</p>
					<p className='mt-2 text-xs text-muted-foreground'>
						Posted {new Date(existingReview.createdAt).toLocaleDateString()}
					</p>
				</CardContent>
			</Card>
		);
	}

	// Can't review - show message
	if (!canReview && !hasReviewed) {
		return (
			<Card>
				<CardContent className='pt-6'>
					<div className='text-center text-muted-foreground'>
						<p className='text-sm'>
							You need to unlock this listing before you can leave a review.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show form for new review or editing
	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-lg'>
					{isEditing ? 'Edit Your Review' : 'Write a Review'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div>
						<label className='text-sm font-medium mb-2 block'>
							Your Rating
						</label>
						<StarRating
							value={rating}
							onChange={(value) => setValue('rating', value)}
							size='lg'
						/>
						{errors.rating && (
							<p className='text-sm text-destructive mt-1'>
								{errors.rating.message}
							</p>
						)}
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>
							Your Review
						</label>
						<Textarea
							{...register('comment')}
							placeholder='Share your experience with this listing...'
							rows={4}
							className='resize-none'
						/>
						{errors.comment && (
							<p className='text-sm text-destructive mt-1'>
								{errors.comment.message}
							</p>
						)}
						<p className='text-xs text-muted-foreground mt-1'>
							Minimum 10 characters, maximum 500 characters
						</p>
					</div>

					<div className='flex gap-2'>
						<Button type='submit' disabled={isPending}>
							{isPending ? (
								<Loader2 className='h-4 w-4 animate-spin mr-2' />
							) : (
								<Send className='h-4 w-4 mr-2' />
							)}
							{isEditing ? 'Update Review' : 'Submit Review'}
						</Button>
						{isEditing && (
							<Button
								type='button'
								variant='outline'
								onClick={() => {
									setIsEditing(false);
									reset({
										rating: existingReview?.rating || 0,
										comment: existingReview?.comment || ''
									});
								}}
							>
								Cancel
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

