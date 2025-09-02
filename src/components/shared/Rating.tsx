import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
	rating: number;
	reviewsCount?: number;
	size?: 'sm' | 'md' | 'lg';
	showCount?: boolean;
	className?: string;
}

export function Rating({
	rating,
	reviewsCount,
	size = 'md',
	showCount = true,
	className
}: RatingProps) {
	const sizeClasses = {
		sm: 'h-3 w-3',
		md: 'h-4 w-4',
		lg: 'h-5 w-5'
	};

	const textSizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};

	return (
		<div className={cn('flex items-center space-x-1', className)}>
			<div className='flex items-center'>
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={cn(
							sizeClasses[size],
							star <= rating
								? 'fill-yellow-400 text-yellow-400'
								: 'text-muted-foreground'
						)}
					/>
				))}
			</div>
			{showCount && reviewsCount !== undefined && (
				<span className={cn('text-muted-foreground', textSizeClasses[size])}>
					({reviewsCount})
				</span>
			)}
		</div>
	);
}
