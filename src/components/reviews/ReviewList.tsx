'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/shared/Skeleton';
import { StarRating } from './StarRating';
import { type Review } from '@/hooks/api/useReviews';
import { MessageSquare } from 'lucide-react';

interface ReviewListProps {
	reviews: Review[];
	isLoading?: boolean;
	averageRating?: number;
	totalReviews?: number;
}

export function ReviewList({
	reviews,
	isLoading = false,
	averageRating = 0,
	totalReviews = 0
}: ReviewListProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
				</CardHeader>
				<CardContent className='space-y-4'>
					{[1, 2, 3].map((i) => (
						<div key={i} className='flex gap-3'>
							<Skeleton className='h-10 w-10 rounded-full' />
							<div className='flex-1 space-y-2'>
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-4 w-20' />
								<Skeleton className='h-16 w-full' />
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-lg'>
						Reviews ({totalReviews})
					</CardTitle>
					{totalReviews > 0 && (
						<div className='flex items-center gap-2'>
							<StarRating value={averageRating} readonly size='sm' />
							<span className='text-sm font-medium'>
								{averageRating.toFixed(1)}
							</span>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{reviews.length === 0 ? (
					<div className='text-center py-8'>
						<MessageSquare className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
						<p className='text-muted-foreground'>
							No reviews yet. Be the first to review!
						</p>
					</div>
				) : (
					<div className='space-y-6'>
						{reviews.map((review) => (
							<ReviewItem key={review.id} review={review} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface ReviewItemProps {
	review: Review;
}

function ReviewItem({ review }: ReviewItemProps) {
	const initials = review.userName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className='flex gap-3'>
			<Avatar className='h-10 w-10'>
				<AvatarImage src={review.userAvatar} />
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className='flex-1'>
				<div className='flex items-center justify-between mb-1'>
					<span className='font-medium text-sm'>{review.userName}</span>
					<span className='text-xs text-muted-foreground'>
						{new Date(review.createdAt).toLocaleDateString()}
					</span>
				</div>
				<StarRating value={review.rating} readonly size='sm' />
				<p className='mt-2 text-sm text-muted-foreground'>{review.comment}</p>
			</div>
		</div>
	);
}

