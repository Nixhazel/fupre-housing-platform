'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import {
	UNIVERSITIES,
	getLocationsForUniversity,
	getUniversityDisplayName
} from '@/lib/config/universities';

interface ListingFiltersProps {
	filters: FilterType;
	onFiltersChange: (filters: FilterType) => void;
	onClose?: () => void;
}

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
	const [availableLocations, setAvailableLocations] = useState<string[]>([]);

	// Update available locations when university changes
	useEffect(() => {
		if (localFilters.university) {
			const locations = getLocationsForUniversity(localFilters.university);
			setAvailableLocations(locations);
			// Clear selected locations that are not valid for the new university
			setLocalFilters((prev) => ({
				...prev,
				locations: prev.locations.filter((loc) => locations.includes(loc))
			}));
		} else {
			setAvailableLocations([]);
			setLocalFilters((prev) => ({
				...prev,
				locations: []
			}));
		}
	}, [localFilters.university]);

	const handleUniversityChange = (universityId: string) => {
		setLocalFilters((prev) => ({
			...prev,
			university: universityId || undefined,
			locations: [] // Reset locations when university changes
		}));
	};

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

	const handleLocationToggle = (location: string) => {
		setLocalFilters((prev) => ({
			...prev,
			locations: prev.locations.includes(location)
				? prev.locations.filter((l) => l !== location)
				: [...prev.locations, location]
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

	const handleVerifiedAgentsToggle = (checked: boolean) => {
		setLocalFilters((prev) => ({
			...prev,
			verifiedAgentsOnly: checked
		}));
	};

	const applyFilters = () => {
		onFiltersChange(localFilters);
		onClose?.();
	};

	const resetFilters = () => {
		const defaultFilters: FilterType = {
			university: undefined,
			locations: [],
			propertyTypes: [],
			priceRange: [0, 5000000] as [number, number],
			bedrooms: [],
			bathrooms: [],
			amenities: [],
			sortBy: 'newest' as const,
			verifiedAgentsOnly: false
		};
		setLocalFilters(defaultFilters);
		onFiltersChange(defaultFilters);
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (localFilters.university) count++;
		if (localFilters.locations.length > 0) count++;
		if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 5000000)
			count++;
		if (localFilters.bedrooms.length > 0) count++;
		if (localFilters.bathrooms.length > 0) count++;
		if (localFilters.amenities.length > 0) count++;
		if (localFilters.verifiedAgentsOnly) count++;
		return count;
	};

	return (
		<div className='space-y-6'>
			{/* Verified Agents Only Toggle */}
			<div className='flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'>
				<div className='flex items-center gap-3'>
					<ShieldCheck className='h-5 w-5 text-green-600' />
					<div>
						<Label
							htmlFor='verified-agents'
							className='text-sm font-medium cursor-pointer'>
							Verified Agents Only
						</Label>
						<p className='text-xs text-muted-foreground'>
							Show listings from verified agents
						</p>
					</div>
				</div>
				<Switch
					id='verified-agents'
					checked={localFilters.verifiedAgentsOnly ?? false}
					onCheckedChange={handleVerifiedAgentsToggle}
				/>
			</div>

			{/* University Selection */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>University *</Label>
				<Select
					value={localFilters.university || 'all'}
					onValueChange={(value) => handleUniversityChange(value === 'all' ? '' : value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select a university' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Universities</SelectItem>
						{UNIVERSITIES.map((uni) => (
							<SelectItem key={uni.id} value={uni.id}>
								{uni.shortName} - {uni.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p className='text-xs text-muted-foreground'>
					Select a university to see available locations
				</p>
			</div>

			{/* Locations (only shown when university is selected) */}
			{localFilters.university && availableLocations.length > 0 && (
				<div className='space-y-3'>
					<Label className='text-base font-semibold'>
						Locations near {getUniversityDisplayName(localFilters.university)}
					</Label>
					<div className='space-y-2'>
						{availableLocations.map((location) => (
							<div key={location} className='flex items-center space-x-2'>
								<Checkbox
									id={`location-${location}`}
									checked={localFilters.locations.includes(location)}
									onCheckedChange={() => handleLocationToggle(location)}
								/>
								<Label htmlFor={`location-${location}`} className='text-sm'>
									{location}
								</Label>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Price Range (Yearly) */}
			<div className='space-y-3'>
				<Label className='text-base font-semibold'>Yearly Rent</Label>
				<div className='space-y-2'>
					<Slider
						value={localFilters.priceRange}
						onValueChange={handlePriceChange}
						max={5000000}
						min={0}
						step={50000}
						className='w-full'
					/>
					<div className='flex justify-between text-sm text-muted-foreground'>
						<span>{formatNaira(localFilters.priceRange[0])}/yr</span>
						<span>{formatNaira(localFilters.priceRange[1])}/yr</span>
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
						{localFilters.verifiedAgentsOnly && (
							<Badge variant='success' className='flex items-center gap-1'>
								<ShieldCheck className='h-3 w-3' />
								Verified Only
							</Badge>
						)}
						{localFilters.university && (
							<Badge variant='secondary'>
								{getUniversityDisplayName(localFilters.university)}
							</Badge>
						)}
						{localFilters.locations.map((location) => (
							<Badge key={location} variant='secondary'>
								{location}
							</Badge>
						))}
						{localFilters.priceRange[0] > 0 && (
							<Badge variant='secondary'>
								Min: {formatNaira(localFilters.priceRange[0])}/yr
							</Badge>
						)}
						{localFilters.priceRange[1] < 5000000 && (
							<Badge variant='secondary'>
								Max: {formatNaira(localFilters.priceRange[1])}/yr
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
