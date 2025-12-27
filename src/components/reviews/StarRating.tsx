'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
	value: number;
	onChange?: (value: number) => void;
	readonly?: boolean;
	size?: 'sm' | 'md' | 'lg';
	showValue?: boolean;
}

const sizeMap = {
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-6 w-6'
};

export function StarRating({
	value,
	onChange,
	readonly = false,
	size = 'md',
	showValue = false
}: StarRatingProps) {
	const [hoverValue, setHoverValue] = useState(0);

	const displayValue = hoverValue || value;

	const handleClick = (rating: number) => {
		if (!readonly && onChange) {
			onChange(rating);
		}
	};

	const handleMouseEnter = (rating: number) => {
		if (!readonly) {
			setHoverValue(rating);
		}
	};

	const handleMouseLeave = () => {
		setHoverValue(0);
	};

	return (
		<div className='flex items-center gap-1'>
			{[1, 2, 3, 4, 5].map((rating) => (
				<button
					key={rating}
					type='button'
					onClick={() => handleClick(rating)}
					onMouseEnter={() => handleMouseEnter(rating)}
					onMouseLeave={handleMouseLeave}
					disabled={readonly}
					className={cn(
						'transition-transform',
						!readonly && 'hover:scale-110 cursor-pointer',
						readonly && 'cursor-default'
					)}
					aria-label={`Rate ${rating} stars`}
				>
					<Star
						className={cn(
							sizeMap[size],
							'transition-colors',
							rating <= displayValue
								? 'fill-yellow-400 text-yellow-400'
								: 'fill-transparent text-muted-foreground'
						)}
					/>
				</button>
			))}
			{showValue && value > 0 && (
				<span className='ml-2 text-sm font-medium'>{value.toFixed(1)}</span>
			)}
		</div>
	);
}

