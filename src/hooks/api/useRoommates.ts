import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions
} from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import type { RoommateListing, PaginationMeta } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

/**
 * Roommates Query Hooks
 *
 * TanStack Query hooks for roommate listing operations
 */

// ============ TYPES ============

export interface RoommatesFilters {
	page?: number;
	limit?: number;
	minBudget?: number;
	maxBudget?: number;
	gender?: 'male' | 'female' | 'any';
	moveInBefore?: string; // ISO date string
	ownerId?: string;
	sortBy?: 'newest' | 'oldest' | 'budget_low' | 'budget_high' | 'move_in_soon';
	[key: string]: unknown;
}

export interface RoommatesResponse {
	listings: RoommateListing[];
	pagination: PaginationMeta;
}

export interface MyRoommatesResponse {
	listings: RoommateListing[];
	pagination: PaginationMeta;
}

export interface RoommateResponse {
	listing: RoommateListing;
}

export interface CreateRoommateData {
	title: string;
	budgetMonthly: number;
	moveInDate: string; // ISO date string
	description: string;
	photos?: string[];
	preferences?: {
		gender?: 'male' | 'female' | 'any';
		cleanliness?: 'low' | 'medium' | 'high';
		studyHours?: 'morning' | 'evening' | 'night' | 'flexible';
		smoking?: 'no' | 'yes' | 'outdoor_only';
		pets?: 'no' | 'yes';
	};
}

export type UpdateRoommateData = Partial<CreateRoommateData>;

export interface DeleteRoommateResponse {
	message: string;
}

// ============ QUERIES ============

/**
 * Hook to fetch paginated roommate listings with filters
 *
 * @param filters - Query filters (page, budget range, gender, etc.)
 * @param options - Additional TanStack Query options
 */
export function useRoommates(
	filters: RoommatesFilters = {},
	options?: Omit<UseQueryOptions<RoommatesResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.roommates.list(filters),
		queryFn: () => api.get<RoommatesResponse>('/roommates', filters),
		staleTime: 30 * 1000, // 30 seconds
		...options
	});
}

/**
 * Hook to fetch current user's roommate listings
 *
 * @param filters - Query filters (page, limit)
 * @param options - Additional TanStack Query options
 */
export function useMyRoommates(
	filters: RoommatesFilters = {},
	options?: Omit<UseQueryOptions<MyRoommatesResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.roommates.mine(filters),
		queryFn: () => api.get<MyRoommatesResponse>('/roommates/me', filters),
		staleTime: 30 * 1000, // 30 seconds
		...options
	});
}

/**
 * Hook to fetch a single roommate listing by ID
 *
 * @param id - Roommate listing ID
 * @param options - Additional TanStack Query options
 */
export function useRoommate(
	id: string,
	options?: Omit<UseQueryOptions<RoommateResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.roommates.detail(id),
		queryFn: () => api.get<RoommateResponse>(`/roommates/${id}`),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
		...options
	});
}

// ============ MUTATIONS ============

/**
 * Hook to create a new roommate listing
 */
export function useCreateRoommate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoommateData) =>
			api.post<RoommateResponse>('/roommates', data),

		onSuccess: () => {
			// Invalidate user's listings
			queryClient.invalidateQueries({ queryKey: queryKeys.roommates.mine() });

			// Invalidate all listings (new one appears)
			queryClient.invalidateQueries({ queryKey: queryKeys.roommates.lists() });
		}
	});
}

/**
 * Hook to update an existing roommate listing
 */
export function useUpdateRoommate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoommateData }) =>
			api.patch<RoommateResponse>(`/roommates/${id}`, data),

		onMutate: async ({ id, data }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.roommates.detail(id) });

			// Snapshot previous value
			const previousListing = queryClient.getQueryData<RoommateResponse>(
				queryKeys.roommates.detail(id)
			);

			// Optimistically update
			if (previousListing) {
				queryClient.setQueryData<RoommateResponse>(queryKeys.roommates.detail(id), {
					listing: { ...previousListing.listing, ...data }
				});
			}

			return { previousListing };
		},

		onError: (_error, variables, context) => {
			// Rollback on error
			if (context?.previousListing) {
				queryClient.setQueryData(
					queryKeys.roommates.detail(variables.id),
					context.previousListing
				);
			}
		},

		onSettled: (_data, _error, variables) => {
			// Refetch to ensure consistency
			queryClient.invalidateQueries({
				queryKey: queryKeys.roommates.detail(variables.id)
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.roommates.mine() });
		}
	});
}

/**
 * Hook to delete a roommate listing
 */
export function useDeleteRoommate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => api.delete<DeleteRoommateResponse>(`/roommates/${id}`),

		onMutate: async (id) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.roommates.mine() });

			// Snapshot previous value
			const previousListings = queryClient.getQueryData<MyRoommatesResponse>(
				queryKeys.roommates.mine()
			);

			// Optimistically remove from list
			if (previousListings) {
				queryClient.setQueryData<MyRoommatesResponse>(queryKeys.roommates.mine(), {
					...previousListings,
					listings: previousListings.listings.filter((l) => l.id !== id),
					pagination: {
						...previousListings.pagination,
						total: previousListings.pagination.total - 1
					}
				});
			}

			return { previousListings };
		},

		onError: (_error, _id, context) => {
			// Rollback on error
			if (context?.previousListings) {
				queryClient.setQueryData(queryKeys.roommates.mine(), context.previousListings);
			}
		},

		onSettled: (_data, _error, id) => {
			// Remove detail from cache
			queryClient.removeQueries({ queryKey: queryKeys.roommates.detail(id) });

			// Refetch lists
			queryClient.invalidateQueries({ queryKey: queryKeys.roommates.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.roommates.mine() });
		}
	});
}

// ============ PREFETCHING ============

/**
 * Prefetch a roommate listing for instant navigation
 */
export function usePrefetchRoommate() {
	const queryClient = useQueryClient();

	return (id: string) => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.roommates.detail(id),
			queryFn: () => api.get<RoommateResponse>(`/roommates/${id}`),
			staleTime: 2 * 60 * 1000
		});
	};
}

/**
 * Prefetch roommates page for instant navigation
 */
export function usePrefetchRoommates() {
	const queryClient = useQueryClient();

	return (filters: RoommatesFilters = {}) => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.roommates.list(filters),
			queryFn: () => api.get<RoommatesResponse>('/roommates', filters),
			staleTime: 30 * 1000
		});
	};
}

// ============ CACHE HELPERS ============

/**
 * Get cached roommate listing data without refetching
 */
export function useRoommateFromCache(id: string): RoommateListing | undefined {
	const queryClient = useQueryClient();
	const data = queryClient.getQueryData<RoommateResponse>(
		queryKeys.roommates.detail(id)
	);
	return data?.listing;
}

/**
 * Invalidate all roommate caches
 */
export function useInvalidateRoommates() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.roommates.all });
	};
}
