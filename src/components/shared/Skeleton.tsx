import { cn } from '@/lib/utils';

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

export function ListingCardSkeleton() {
	return (
		<div className='rounded-lg border bg-card'>
			<Skeleton className='h-48 w-full rounded-t-lg' />
			<div className='p-4 space-y-3'>
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-3 w-1/2' />
				<div className='flex items-center space-x-2'>
					<Skeleton className='h-3 w-16' />
					<Skeleton className='h-3 w-20' />
				</div>
				<div className='flex items-center justify-between'>
					<Skeleton className='h-4 w-24' />
					<Skeleton className='h-6 w-16 rounded-full' />
				</div>
			</div>
		</div>
	);
}

export function RoommateCardSkeleton() {
	return (
		<div className='rounded-lg border bg-card p-4'>
			<div className='space-y-3'>
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-3 w-1/2' />
				<div className='flex space-x-2'>
					<Skeleton className='h-6 w-16 rounded-full' />
					<Skeleton className='h-6 w-20 rounded-full' />
				</div>
				<Skeleton className='h-3 w-full' />
				<Skeleton className='h-3 w-2/3' />
				<div className='flex items-center justify-between'>
					<Skeleton className='h-3 w-24' />
					<Skeleton className='h-8 w-20' />
				</div>
			</div>
		</div>
	);
}
