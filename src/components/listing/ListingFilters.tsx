'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/shared/Badge';
import { ListingFilters as FilterType } from '@/types';
import { formatNaira } from '@/lib/utils/currency';

interface ListingFiltersProps {
	filters: FilterType;
	onFiltersChange: (filters: FilterType) => void;
	onClose?: () => void;
}

const campusAreas = ['Ugbomro', 'Effurun', 'Enerhen', 'PTI Road', 'Other'];
const amenities = [
	'Wi-Fi',
	'Water',
	'24/7 Power',
	'Security',
	'Furnished',
	'Proximity to shuttle',
	'Kitchenette',
	'AC',
	'Wardrobe',
	'Garden'
];

export function ListingFilters({
	filters,
	onFiltersChange,
	onClose
}: ListingFiltersProps) {
	const [localFilters, setLocalFilters] = useState(filters);

	const handlePriceChange = (value: number[]) => {
		setLocalFilters((prev) => ({
			...prev,
			priceRange: value as [number, number]
		}));
	};

	const handleBedroomToggle = (bedrooms: number) => {
		setLocalFilters((prev) => ({
			...prev,
			bedrooms: prev.bedrooms.includes(bedrooms)
				? prev.bedrooms.filter((b) => b !== bedrooms)
				: [...prev.bedrooms, bedrooms]
		}));
	};

	const handleBathroomToggle = (bathrooms: number) => {
		setLocalFilters((prev) => ({
			...prev,
			bathrooms: prev.bathrooms.includes(bathrooms)
				? prev.bathrooms.filter((b) => b !== bathrooms)
				: [...prev.bathrooms, bathrooms]
		}));
	};

	const handleCampusAreaToggle = (area: string) => {
		setLocalFilters((prev) => ({
			...prev,
			campusAreas: prev.campusAreas.includes(area)
				? prev.campusAreas.filter((a) => a !== area)
				: [...prev.campusAreas, area]
		}));
	};

	const handleAmenityToggle = (amenity: string) => {
		setLocalFilters((prev) => ({
			...prev,
			amenities: prev.amenities.includes(amenity)
				? prev.amenities.filter((a) => a !== amenity)
				: [...prev.amenities, amenity]
		}));
	};

	const handleSortChange = (sortBy: string) => {
		setLocalFilters((prev) => ({
			...prev,
			sortBy: sortBy as 'newest' | 'price_asc' | 'price_desc' | 'rating'
		}));
	};

	const applyFilters = () => {
		onFiltersChange(localFilters);
		onClose?.();
	};

	const resetFilters = () => {
		const defaultFilters = {
			priceRange: [0, 100000] as [number, number],
			bedrooms: [],
			bathrooms: [],
			campusAreas: [],
			amenities: [],
			sortBy: 'newest' as const
		};
		setLocalFilters(defaultFilters);
		onFiltersChange(defaultFilters);
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 100000)
			count++;
		if (localFilters.bedrooms.length > 0) count++;
		if (localFilters.bathrooms.length > 0) count++;
		if (localFilters.campusAreas.length > 0) count++;
		if (localFilters.amenities.length > 0) count++;
		return count;
	};

	return (
		<div className='space-y-6'>
			{/* Price Range */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Price Range</Label>
				<div className='space-y-2'>
					<Slider
						value={localFilters.priceRange}
						onValueChange={handlePriceChange}
						max={100000}
						min={0}
						step={5000}
						className='w-full'
					/>
					<div className='flex justify-between text-sm text-muted-foreground'>
						<span>{formatNaira(localFilters.priceRange[0])}</span>
						<span>{formatNaira(localFilters.priceRange[1])}</span>
					</div>
				</div>
			</div>

			{/* Bedrooms */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Bedrooms</Label>
				<div className='flex flex-wrap gap-2'>
					{[1, 2, 3, 4, 5].map((bedrooms) => (
						<Button
							key={bedrooms}
							variant={
								localFilters.bedrooms.includes(bedrooms) ? 'default' : 'outline'
							}
							size='sm'
							onClick={() => handleBedroomToggle(bedrooms)}>
							{bedrooms} bed{bedrooms !== 1 ? 's' : ''}
						</Button>
					))}
				</div>
			</div>

			{/* Bathrooms */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Bathrooms</Label>
				<div className='flex flex-wrap gap-2'>
					{[1, 2, 3, 4].map((bathrooms) => (
						<Button
							key={bathrooms}
							variant={
								localFilters.bathrooms.includes(bathrooms)
									? 'default'
									: 'outline'
							}
							size='sm'
							onClick={() => handleBathroomToggle(bathrooms)}>
							{bathrooms} bath{bathrooms !== 1 ? 's' : ''}
						</Button>
					))}
				</div>
			</div>

			{/* Campus Areas */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Campus Areas</Label>
				<div className='space-y-2'>
					{campusAreas.map((area) => (
						<div key={area} className='flex items-center space-x-2'>
							<Checkbox
								id={`area-${area}`}
								checked={localFilters.campusAreas.includes(area)}
								onCheckedChange={() => handleCampusAreaToggle(area)}
							/>
							<Label htmlFor={`area-${area}`} className='text-sm'>
								{area}
							</Label>
						</div>
					))}
				</div>
			</div>

			{/* Amenities */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Amenities</Label>
				<div className='space-y-2'>
					{amenities.map((amenity) => (
						<div key={amenity} className='flex items-center space-x-2'>
							<Checkbox
								id={`amenity-${amenity}`}
								checked={localFilters.amenities.includes(amenity)}
								onCheckedChange={() => handleAmenityToggle(amenity)}
							/>
							<Label htmlFor={`amenity-${amenity}`} className='text-sm'>
								{amenity}
							</Label>
						</div>
					))}
				</div>
			</div>

			{/* Sort By */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Sort By</Label>
				<Select value={localFilters.sortBy} onValueChange={handleSortChange}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='newest'>Newest First</SelectItem>
						<SelectItem value='price_asc'>Price: Low to High</SelectItem>
						<SelectItem value='price_desc'>Price: High to Low</SelectItem>
						<SelectItem value='rating'>Highest Rated</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Active Filters */}
			{getActiveFiltersCount() > 0 && (
				<div className='space-y-3'>
					<Label className='text-base font-semibold'>Active Filters</Label>
					<div className='flex flex-wrap gap-2'>
						{localFilters.priceRange[0] > 0 && (
							<Badge variant='secondary'>
								Min: {formatNaira(localFilters.priceRange[0])}
							</Badge>
						)}
						{localFilters.priceRange[1] < 100000 && (
							<Badge variant='secondary'>
								Max: {formatNaira(localFilters.priceRange[1])}
							</Badge>
						)}
						{localFilters.bedrooms.map((bedrooms) => (
							<Badge key={bedrooms} variant='secondary'>
								{bedrooms} bed{bedrooms !== 1 ? 's' : ''}
							</Badge>
						))}
						{localFilters.bathrooms.map((bathrooms) => (
							<Badge key={bathrooms} variant='secondary'>
								{bathrooms} bath{bathrooms !== 1 ? 's' : ''}
							</Badge>
						))}
						{localFilters.campusAreas.map((area) => (
							<Badge key={area} variant='secondary'>
								{area}
							</Badge>
						))}
						{localFilters.amenities.slice(0, 3).map((amenity) => (
							<Badge key={amenity} variant='secondary'>
								{amenity}
							</Badge>
						))}
						{localFilters.amenities.length > 3 && (
							<Badge variant='secondary'>
								+{localFilters.amenities.length - 3} more
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
