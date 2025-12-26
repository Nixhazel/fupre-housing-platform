import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions
} from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import type {
	Listing,
	AgentStats,
	MonthlyEarning,
	PaginationMeta
} from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

/**
 * Agent Query Hooks
 *
 * TanStack Query hooks for agent dashboard operations
 */

// ============ TYPES ============

export interface AgentListingsFilters {
	page?: number;
	limit?: number;
	status?: 'available' | 'taken';
	sortBy?: 'newest' | 'oldest' | 'views' | 'unlocks';
	[key: string]: unknown;
}

// The API returns AgentStats directly (not wrapped in { stats: ... })
export type AgentStatsResponse = AgentStats;

export interface AgentEarningsResponse {
	earnings: MonthlyEarning[];
	total: number;
	monthsIncluded: number;
}

export interface AgentListingsResponse {
	listings: (Listing & {
		unlocksCount: number;
		earningsTotal: number;
	})[];
	pagination: PaginationMeta;
}

export interface CreateListingData {
	title: string;
	description: string;
	campusArea: 'Ugbomro' | 'Effurun' | 'Enerhen' | 'PTI Road' | 'Other';
	addressApprox: string;
	addressFull: string;
	priceMonthly: number;
	bedrooms: number;
	bathrooms: number;
	distanceToCampusKm: number;
	amenities: string[];
	photos: string[];
	coverPhoto: string;
	mapPreview: string;
	mapFull: string;
}

export interface UpdateListingData extends Partial<CreateListingData> {
	status?: 'available' | 'taken';
}

export interface ListingResponse {
	listing: Listing;
}

export interface DeleteListingResponse {
	message: string;
}

// ============ QUERIES ============

/**
 * Hook to fetch agent dashboard statistics
 *
 * @param options - Additional TanStack Query options
 */
export function useAgentStats(
	options?: Omit<
		UseQueryOptions<AgentStatsResponse, ApiError>,
		'queryKey' | 'queryFn'
	>
) {
	return useQuery({
		queryKey: queryKeys.agent.stats(),
		queryFn: () => api.get<AgentStatsResponse>('/agents/me/stats'),
		staleTime: 60 * 1000, // 1 minute
		...options
	});
}

/**
 * Hook to fetch agent earnings history
 *
 * @param months - Number of months to fetch (default: 12)
 * @param options - Additional TanStack Query options
 */
export function useAgentEarnings(
	months: number = 12,
	options?: Omit<
		UseQueryOptions<AgentEarningsResponse, ApiError>,
		'queryKey' | 'queryFn'
	>
) {
	return useQuery({
		queryKey: queryKeys.agent.earnings(months),
		queryFn: () =>
			api.get<AgentEarningsResponse>('/agents/me/earnings', { months }),
		staleTime: 5 * 60 * 1000, // 5 minutes
		...options
	});
}

/**
 * Hook to fetch agent's listings with stats
 *
 * @param filters - Query filters (page, status, sortBy)
 * @param options - Additional TanStack Query options
 */
export function useAgentListings(
	filters: AgentListingsFilters = {},
	options?: Omit<
		UseQueryOptions<AgentListingsResponse, ApiError>,
		'queryKey' | 'queryFn'
	>
) {
	return useQuery({
		queryKey: queryKeys.agent.listings(filters),
		queryFn: () =>
			api.get<AgentListingsResponse>('/agents/me/listings', filters),
		staleTime: 30 * 1000, // 30 seconds
		...options
	});
}

// ============ MUTATIONS ============

/**
 * Hook to create a new listing (Agent only)
 */
export function useCreateListing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateListingData) =>
			api.post<ListingResponse>('/listings', data),

		onSuccess: () => {
			// Invalidate agent's listings
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.listings() });

			// Invalidate agent stats
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.stats() });

			// Invalidate public listings
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
		}
	});
}

/**
 * Hook to update an existing listing (Agent only)
 */
export function useUpdateListing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateListingData }) =>
			api.patch<ListingResponse>(`/listings/${id}`, data),

		onMutate: async ({ id, data }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({
				queryKey: queryKeys.listings.detail(id)
			});

			// Snapshot previous value
			const previousListing = queryClient.getQueryData<{
				listing: Listing;
				isUnlocked: boolean;
			}>(queryKeys.listings.detail(id));

			// Optimistically update
			if (previousListing) {
				queryClient.setQueryData(queryKeys.listings.detail(id), {
					...previousListing,
					listing: { ...previousListing.listing, ...data }
				});
			}

			return { previousListing };
		},

		onError: (_error, variables, context) => {
			// Rollback on error
			if (context?.previousListing) {
				queryClient.setQueryData(
					queryKeys.listings.detail(variables.id),
					context.previousListing
				);
			}
		},

		onSettled: (_data, _error, variables) => {
			// Refetch to ensure consistency
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.detail(variables.id)
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.listings() });
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
		}
	});
}

/**
 * Hook to mark a listing as taken
 */
export function useMarkListingAsTaken() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (listingId: string) =>
			api.patch<ListingResponse>(`/listings/${listingId}`, { status: 'taken' }),

		onSuccess: (_data, listingId) => {
			// Update detail cache
			const existing = queryClient.getQueryData<{
				listing: Listing;
				isUnlocked: boolean;
			}>(queryKeys.listings.detail(listingId));
			if (existing) {
				queryClient.setQueryData(queryKeys.listings.detail(listingId), {
					...existing,
					listing: { ...existing.listing, status: 'taken' }
				});
			}

			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.listings() });
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.stats() });
		}
	});
}

/**
 * Hook to mark a listing as available
 */
export function useMarkListingAsAvailable() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (listingId: string) =>
			api.patch<ListingResponse>(`/listings/${listingId}`, {
				status: 'available'
			}),

		onSuccess: (_data, listingId) => {
			// Update detail cache
			const existing = queryClient.getQueryData<{
				listing: Listing;
				isUnlocked: boolean;
			}>(queryKeys.listings.detail(listingId));
			if (existing) {
				queryClient.setQueryData(queryKeys.listings.detail(listingId), {
					...existing,
					listing: { ...existing.listing, status: 'available' }
				});
			}

			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.listings() });
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.stats() });
		}
	});
}

/**
 * Hook to delete a listing (soft delete)
 */
export function useDeleteListing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (listingId: string) =>
			api.delete<DeleteListingResponse>(`/listings/${listingId}`),

		onMutate: async (listingId) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.agent.listings() });

			// Snapshot previous value
			const previousListings = queryClient.getQueryData<AgentListingsResponse>(
				queryKeys.agent.listings()
			);

			// Optimistically remove from list
			if (previousListings) {
				queryClient.setQueryData<AgentListingsResponse>(
					queryKeys.agent.listings(),
					{
						...previousListings,
						listings: previousListings.listings.filter(
							(l) => l.id !== listingId
						),
						pagination: {
							...previousListings.pagination,
							total: previousListings.pagination.total - 1
						}
					}
				);
			}

			return { previousListings };
		},

		onError: (_error, _listingId, context) => {
			// Rollback on error
			if (context?.previousListings) {
				queryClient.setQueryData(
					queryKeys.agent.listings(),
					context.previousListings
				);
			}
		},

		onSettled: (_data, _error, listingId) => {
			// Remove detail from cache
			queryClient.removeQueries({
				queryKey: queryKeys.listings.detail(listingId)
			});

			// Refetch lists and stats
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.listings() });
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.agent.stats() });
		}
	});
}

// ============ CACHE HELPERS ============

/**
 * Invalidate all agent-related caches
 */
export function useInvalidateAgent() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.agent.all });
	};
}

/**
 * Get cached agent stats without refetching
 */
export function useAgentStatsFromCache(): AgentStats | undefined {
	const queryClient = useQueryClient();
	// AgentStatsResponse is now AgentStats directly
	return queryClient.getQueryData<AgentStatsResponse>(queryKeys.agent.stats());
}

/**
 * Prefetch agent dashboard data
 *
 * Call this when navigating to agent dashboard for faster load
 */
export function usePrefetchAgentDashboard() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.agent.stats(),
			queryFn: () => api.get<AgentStatsResponse>('/agents/me/stats'),
			staleTime: 60 * 1000
		});

		queryClient.prefetchQuery({
			queryKey: queryKeys.agent.earnings(),
			queryFn: () => api.get<AgentEarningsResponse>('/agents/me/earnings'),
			staleTime: 5 * 60 * 1000
		});

		queryClient.prefetchQuery({
			queryKey: queryKeys.agent.listings(),
			queryFn: () => api.get<AgentListingsResponse>('/agents/me/listings'),
			staleTime: 30 * 1000
		});
	};
}
