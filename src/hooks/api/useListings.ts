import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions
} from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import type { Listing, PaginationMeta } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

/**
 * Listings Query Hooks
 *
 * TanStack Query hooks for listing operations
 */

// ============ TYPES ============

export interface ListingsFilters {
	page?: number;
	limit?: number;
	search?: string;
	university?: string;
	location?: string;
	minPrice?: number;
	maxPrice?: number;
	bedrooms?: number;
	bathrooms?: number;
	status?: 'available' | 'taken';
	agentId?: string;
	sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating' | 'views';
	verifiedAgentsOnly?: boolean;
	[key: string]: unknown;
}

export interface ListingsResponse {
	listings: Listing[];
	pagination: PaginationMeta;
}

export interface SingleListingResponse {
	listing: Listing;
	isUnlocked: boolean;
}

export interface SavedListingsResponse {
	listings: Listing[];
}

export interface SaveListingResponse {
	message: string;
	savedListingIds: string[];
}

// ============ QUERIES ============

/**
 * Hook to fetch paginated listings with filters
 *
 * @param filters - Query filters (page, search, university, location, etc.)
 * @param options - Additional TanStack Query options
 */
export function useListings(
	filters: ListingsFilters = {},
	options?: Omit<UseQueryOptions<ListingsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.listings.list(filters),
		queryFn: () => api.get<ListingsResponse>('/listings', filters),
		staleTime: 30 * 1000, // 30 seconds
		...options
	});
}

/**
 * Hook to fetch a single listing by ID
 *
 * @param id - Listing ID
 * @param options - Additional TanStack Query options
 */
export function useListing(
	id: string,
	options?: Omit<UseQueryOptions<SingleListingResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.listings.detail(id),
		queryFn: () => api.get<SingleListingResponse>(`/listings/${id}`),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
		...options
	});
}

/**
 * Hook to fetch saved listings for current user
 *
 * @param options - Additional TanStack Query options
 */
export function useSavedListings(
	options?: Omit<UseQueryOptions<SavedListingsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.listings.saved(),
		queryFn: () => api.get<SavedListingsResponse>('/users/me/saved'),
		staleTime: 60 * 1000, // 1 minute
		...options
	});
}

// ============ MUTATIONS ============

/**
 * Hook to save a listing to favorites
 */
export function useSaveListing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (listingId: string) =>
			api.post<SaveListingResponse>('/users/me/saved', { listingId }),

		onSuccess: () => {
			// Invalidate saved listings
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.saved() });

			// Update auth me to reflect new savedListingIds
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
		}
	});
}

/**
 * Hook to remove a listing from favorites
 */
export function useUnsaveListing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (listingId: string) =>
			api.delete<SaveListingResponse>(`/users/me/saved/${listingId}`),

		onSuccess: () => {
			// Invalidate saved listings
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.saved() });

			// Update auth me
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
		}
	});
}

/**
 * Hook to toggle save status on a listing
 *
 * Determines whether to save or unsave based on current state
 */
export function useToggleSaveListing() {
	const saveMutation = useSaveListing();
	const unsaveMutation = useUnsaveListing();

	const toggleSave = async (listingId: string, isSaved: boolean) => {
		if (isSaved) {
			return unsaveMutation.mutateAsync(listingId);
		} else {
			return saveMutation.mutateAsync(listingId);
		}
	};

	return {
		toggleSave,
		isPending: saveMutation.isPending || unsaveMutation.isPending,
		isError: saveMutation.isError || unsaveMutation.isError,
		error: saveMutation.error || unsaveMutation.error
	};
}


// ============ PREFETCHING ============

/**
 * Prefetch a listing for instant navigation
 *
 * Call this on hover/focus to preload listing data
 */
export function usePrefetchListing() {
	const queryClient = useQueryClient();

	return (id: string) => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.listings.detail(id),
			queryFn: () => api.get<SingleListingResponse>(`/listings/${id}`),
			staleTime: 2 * 60 * 1000
		});
	};
}

/**
 * Prefetch listings page for instant navigation
 */
export function usePrefetchListings() {
	const queryClient = useQueryClient();

	return (filters: ListingsFilters = {}) => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.listings.list(filters),
			queryFn: () => api.get<ListingsResponse>('/listings', filters),
			staleTime: 30 * 1000
		});
	};
}

// ============ CACHE HELPERS ============

/**
 * Get cached listing data without refetching
 */
export function useListingFromCache(id: string): Listing | undefined {
	const queryClient = useQueryClient();
	const data = queryClient.getQueryData<SingleListingResponse>(
		queryKeys.listings.detail(id)
	);
	return data?.listing;
}

/**
 * Invalidate all listing caches
 *
 * Useful after bulk operations
 */
export function useInvalidateListings() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
	};
}
