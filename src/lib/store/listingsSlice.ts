import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Listing, ListingFilters, ListingForm } from '@/types';
import { listingsData } from '@/data/listings';

interface ListingsSlice {
	listings: Listing[];
	filters: ListingFilters;
	searchQuery: string;
	viewMode: 'grid' | 'list';

	// Actions
	setFilters: (filters: Partial<ListingFilters>) => void;
	setSearchQuery: (query: string) => void;
	setViewMode: (mode: 'grid' | 'list') => void;
	resetFilters: () => void;

	// CRUD operations
	createListing: (listing: ListingForm) => void;
	updateListing: (id: string, updates: Partial<Listing>) => void;
	deleteListing: (id: string) => void;
	markAsTaken: (id: string) => void;
	incrementViews: (id: string) => void;

	// Computed
	getFilteredListings: () => Listing[];
	getListingById: (id: string) => Listing | undefined;
	getListingsByAgent: (agentId: string) => Listing[];
}

const defaultFilters: ListingFilters = {
	priceRange: [0, 100000],
	bedrooms: [],
	bathrooms: [],
	campusAreas: [],
	amenities: [],
	sortBy: 'newest'
};

export const useListingsStore = create<ListingsSlice>()(
	persist(
		(set, get) => ({
			listings: listingsData,
			filters: defaultFilters,
			searchQuery: '',
			viewMode: 'grid',

			setFilters: (newFilters) => {
				set((state) => ({
					filters: { ...state.filters, ...newFilters }
				}));
			},

			setSearchQuery: (query) => {
				set({ searchQuery: query });
			},

			setViewMode: (mode) => {
				set({ viewMode: mode });
			},

			resetFilters: () => {
				set({ filters: defaultFilters, searchQuery: '' });
			},

			createListing: (listingData) => {
				const listingId = `listing-${Math.random().toString(36).substr(2, 9)}`;
				const mapId = Math.random().toString(36).substr(2, 9);
				const newListing: Listing = {
					id: listingId,
					...listingData,
					campusArea: listingData.campusArea as
						| 'Ugbomro'
						| 'Effurun'
						| 'Enerhen'
						| 'PTI Road'
						| 'Other',
					agentId: 'current-user', // This should be set from the current user context
					status: 'available',
					rating: 0,
					reviewsCount: 0,
					views: 0,
					createdAt: new Date().toISOString(),
					mapPreview: `/maps/${mapId}-blur.jpg`,
					mapFull: `/maps/${mapId}-full.jpg`
				};

				set((state) => ({
					listings: [newListing, ...state.listings]
				}));
			},

			updateListing: (id, updates) => {
				set((state) => ({
					listings: state.listings.map((listing) =>
						listing.id === id ? { ...listing, ...updates } : listing
					)
				}));
			},

			deleteListing: (id) => {
				set((state) => ({
					listings: state.listings.filter((listing) => listing.id !== id)
				}));
			},

			markAsTaken: (id) => {
				set((state) => ({
					listings: state.listings.map((listing) =>
						listing.id === id
							? { ...listing, status: 'taken' as const }
							: listing
					)
				}));
			},

			incrementViews: (id) => {
				set((state) => ({
					listings: state.listings.map((listing) =>
						listing.id === id
							? { ...listing, views: listing.views + 1 }
							: listing
					)
				}));
			},

			getFilteredListings: () => {
				const { listings, filters, searchQuery } = get();

				const filtered = listings.filter((listing) => {
					// Search query
					if (searchQuery) {
						const query = searchQuery.toLowerCase();
						if (
							!listing.title.toLowerCase().includes(query) &&
							!listing.description.toLowerCase().includes(query) &&
							!listing.campusArea.toLowerCase().includes(query) &&
							!listing.addressApprox.toLowerCase().includes(query)
						) {
							return false;
						}
					}

					// Price range
					if (
						listing.priceMonthly < filters.priceRange[0] ||
						listing.priceMonthly > filters.priceRange[1]
					) {
						return false;
					}

					// Bedrooms
					if (
						filters.bedrooms.length > 0 &&
						!filters.bedrooms.includes(listing.bedrooms)
					) {
						return false;
					}

					// Bathrooms
					if (
						filters.bathrooms.length > 0 &&
						!filters.bathrooms.includes(listing.bathrooms)
					) {
						return false;
					}

					// Campus areas
					if (
						filters.campusAreas.length > 0 &&
						!filters.campusAreas.includes(listing.campusArea)
					) {
						return false;
					}

					// Amenities
					if (filters.amenities.length > 0) {
						const hasAllAmenities = filters.amenities.every((amenity) =>
							listing.amenities.includes(amenity)
						);
						if (!hasAllAmenities) return false;
					}

					return true;
				});

				// Sort
				switch (filters.sortBy) {
					case 'price_asc':
						filtered.sort((a, b) => a.priceMonthly - b.priceMonthly);
						break;
					case 'price_desc':
						filtered.sort((a, b) => b.priceMonthly - a.priceMonthly);
						break;
					case 'rating':
						filtered.sort((a, b) => b.rating - a.rating);
						break;
					case 'newest':
					default:
						filtered.sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime()
						);
						break;
				}

				return filtered;
			},

			getListingById: (id) => {
				return get().listings.find((listing) => listing.id === id);
			},

			getListingsByAgent: (agentId) => {
				return get().listings.filter((listing) => listing.agentId === agentId);
			}
		}),
		{
			name: 'listings-storage',
			partialize: (state) => ({
				listings: state.listings,
				filters: state.filters,
				viewMode: state.viewMode
			}),
			skipHydration: true
		}
	)
);
