'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/shared/Badge';
import { RoommateFilters as FilterType } from '@/types';
import { formatNaira } from '@/lib/utils/currency';

interface RoommateFiltersProps {
	filters: FilterType;
	onFiltersChange: (filters: Partial<FilterType>) => void;
	onClose?: () => void;
}

export function RoommateFilters({
	filters,
	onFiltersChange,
	onClose
}: RoommateFiltersProps) {
	const [localFilters, setLocalFilters] = useState(filters);

	const handleBudgetChange = (value: number[]) => {
		setLocalFilters((prev) => ({
			...prev,
			budgetRange: value as [number, number]
		}));
	};

	const handleGenderChange = (gender: string) => {
		setLocalFilters((prev) => ({
			...prev,
			gender: gender === 'any' ? undefined : (gender as 'male' | 'female')
		}));
	};

	const handleCleanlinessChange = (cleanliness: string) => {
		setLocalFilters((prev) => ({
			...prev,
			cleanliness:
				cleanliness === 'any'
					? undefined
					: (cleanliness as 'low' | 'medium' | 'high')
		}));
	};

	const handleMoveInDateChange = (date: string) => {
		setLocalFilters((prev) => ({ ...prev, moveInDate: date || undefined }));
	};

	const applyFilters = () => {
		onFiltersChange(localFilters);
		onClose?.();
	};

	const resetFilters = () => {
		const defaultFilters = {
			budgetRange: [0, 100000] as [number, number]
		};
		setLocalFilters(defaultFilters);
		onFiltersChange(defaultFilters);
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (localFilters.budgetRange[0] > 0 || localFilters.budgetRange[1] < 100000)
			count++;
		if (localFilters.gender) count++;
		if (localFilters.cleanliness) count++;
		if (localFilters.moveInDate) count++;
		return count;
	};

	return (
		<div className='space-y-6'>
			{/* Budget Range */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Budget Range</Label>
				<div className='space-y-2'>
					<Slider
						value={localFilters.budgetRange}
						onValueChange={handleBudgetChange}
						max={100000}
						min={0}
						step={5000}
						className='w-full'
					/>
					<div className='flex justify-between text-sm text-muted-foreground'>
						<span>{formatNaira(localFilters.budgetRange[0])}</span>
						<span>{formatNaira(localFilters.budgetRange[1])}</span>
					</div>
				</div>
			</div>

			{/* Gender Preference */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Gender Preference</Label>
				<Select
					value={localFilters.gender || 'any'}
					onValueChange={handleGenderChange}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='any'>Any Gender</SelectItem>
						<SelectItem value='male'>Male</SelectItem>
						<SelectItem value='female'>Female</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Cleanliness Preference */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Cleanliness Level</Label>
				<Select
					value={localFilters.cleanliness || 'any'}
					onValueChange={handleCleanlinessChange}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='any'>Any Level</SelectItem>
						<SelectItem value='low'>Low</SelectItem>
						<SelectItem value='medium'>Medium</SelectItem>
						<SelectItem value='high'>High</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Move-in Date */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Move-in Date</Label>
				<input
					type='date'
					value={localFilters.moveInDate || ''}
					onChange={(e) => handleMoveInDateChange(e.target.value)}
					className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm'
					min={new Date().toISOString().split('T')[0]}
				/>
				<p className='text-xs text-muted-foreground'>
					Find roommates moving in around the same time
				</p>
			</div>

			{/* Active Filters */}
			{getActiveFiltersCount() > 0 && (
				<div className='space-y-3'>
					<Label className='text-base font-semibold'>Active Filters</Label>
					<div className='flex flex-wrap gap-2'>
						{localFilters.budgetRange[0] > 0 && (
							<Badge variant='secondary'>
								Min: {formatNaira(localFilters.budgetRange[0])}
							</Badge>
						)}
						{localFilters.budgetRange[1] < 100000 && (
							<Badge variant='secondary'>
								Max: {formatNaira(localFilters.budgetRange[1])}
							</Badge>
						)}
						{localFilters.gender && (
							<Badge variant='secondary'>Gender: {localFilters.gender}</Badge>
						)}
						{localFilters.cleanliness && (
							<Badge variant='secondary'>
								Cleanliness: {localFilters.cleanliness}
							</Badge>
						)}
						{localFilters.moveInDate && (
							<Badge variant='secondary'>
								Move-in:{' '}
								{new Date(localFilters.moveInDate).toLocaleDateString()}
							</Badge>
						)}
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className='flex gap-2 pt-4 border-t'>
				<Button onClick={applyFilters} className='flex-1'>
					Apply Filters
				</Button>
				<Button variant='outline' onClick={resetFilters}>
					Reset
				</Button>
			</div>
		</div>
	);
}
