import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoommateListing, RoommateFilters, RoommateForm } from '@/types';
import { roommateListingsData } from '@/data/roommates';

interface RoommatesSlice {
	roommateListings: RoommateListing[];
	filters: RoommateFilters;
	searchQuery: string;

	// Actions
	setFilters: (filters: Partial<RoommateFilters>) => void;
	setSearchQuery: (query: string) => void;
	resetFilters: () => void;

	// CRUD operations
	createRoommateListing: (
		listing: RoommateForm & { ownerId: string; ownerType: 'student' | 'owner' }
	) => void;
	updateRoommateListing: (
		id: string,
		updates: Partial<RoommateListing>
	) => void;
	deleteRoommateListing: (id: string) => void;

	// Computed
	getFilteredRoommateListings: () => RoommateListing[];
	getRoommateListingById: (id: string) => RoommateListing | undefined;
	getRoommateListingsByOwner: (ownerId: string) => RoommateListing[];
}

const defaultFilters: RoommateFilters = {
	budgetRange: [0, 100000]
};

export const useRoommatesStore = create<RoommatesSlice>()(
	persist(
		(set, get) => ({
			roommateListings: roommateListingsData,
			filters: defaultFilters,
			searchQuery: '',

			setFilters: (newFilters) => {
				set((state) => ({
					filters: { ...state.filters, ...newFilters }
				}));
			},

			setSearchQuery: (query) => {
				set({ searchQuery: query });
			},

			resetFilters: () => {
				set({ filters: defaultFilters, searchQuery: '' });
			},

			createRoommateListing: (listingData) => {
				const newListing: RoommateListing = {
					id: `roommate-${Math.random().toString(36).substr(2, 9)}`,
					...listingData,
					createdAt: new Date().toISOString()
				};

				set((state) => ({
					roommateListings: [newListing, ...state.roommateListings]
				}));
			},

			updateRoommateListing: (id, updates) => {
				set((state) => ({
					roommateListings: state.roommateListings.map((listing) =>
						listing.id === id ? { ...listing, ...updates } : listing
					)
				}));
			},

			deleteRoommateListing: (id) => {
				set((state) => ({
					roommateListings: state.roommateListings.filter(
						(listing) => listing.id !== id
					)
				}));
			},

			getFilteredRoommateListings: () => {
				const { roommateListings, filters, searchQuery } = get();

				const filtered = roommateListings.filter((listing) => {
					// Search query
					if (searchQuery) {
						const query = searchQuery.toLowerCase();
						if (
							!listing.title.toLowerCase().includes(query) &&
							!listing.description.toLowerCase().includes(query)
						) {
							return false;
						}
					}

					// Budget range
					if (
						listing.budgetMonthly < filters.budgetRange[0] ||
						listing.budgetMonthly > filters.budgetRange[1]
					) {
						return false;
					}

					// Gender preference
					if (
						filters.gender &&
						filters.gender !== 'any' &&
						listing.preferences.gender &&
						listing.preferences.gender !== 'any'
					) {
						if (filters.gender !== listing.preferences.gender) {
							return false;
						}
					}

					// Cleanliness preference
					if (filters.cleanliness && listing.preferences.cleanliness) {
						if (filters.cleanliness !== listing.preferences.cleanliness) {
							return false;
						}
					}

					// Move-in date
					if (filters.moveInDate) {
						const listingDate = new Date(listing.moveInDate);
						const filterDate = new Date(filters.moveInDate);
						const diffDays =
							Math.abs(listingDate.getTime() - filterDate.getTime()) /
							(1000 * 60 * 60 * 24);
						if (diffDays > 30) {
							// Allow 30 days tolerance
							return false;
						}
					}

					return true;
				});

				// Sort by newest first
				filtered.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);

				return filtered;
			},

			getRoommateListingById: (id) => {
				return get().roommateListings.find((listing) => listing.id === id);
			},

			getRoommateListingsByOwner: (ownerId) => {
				return get().roommateListings.filter(
					(listing) => listing.ownerId === ownerId
				);
			}
		}),
		{
			name: 'roommates-storage',
			partialize: (state) => ({
				roommateListings: state.roommateListings,
				filters: state.filters
			}),
			skipHydration: true
		}
	)
);
