import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions
} from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import type { PlatformStats, PaginationMeta, SessionUser } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

/**
 * Admin Query Hooks
 *
 * TanStack Query hooks for admin dashboard operations
 */

// ============ TYPES ============

export interface UsersFilters {
	page?: number;
	limit?: number;
	role?: 'student' | 'agent' | 'owner' | 'admin';
	isVerified?: boolean;
	isEmailVerified?: boolean;
	search?: string;
	sortBy?: 'newest' | 'oldest' | 'name' | 'email';
	[key: string]: unknown;
}

export interface PlatformStatsResponse {
	stats: PlatformStats;
}

export interface UsersResponse {
	users: SessionUser[];
	pagination: PaginationMeta;
}

export interface UserResponse {
	user: SessionUser;
}

export interface UpdateUserData {
	name?: string;
	phone?: string;
	role?: 'student' | 'agent' | 'owner' | 'admin';
	isVerified?: boolean;
	isEmailVerified?: boolean;
}

export interface DeleteUserResponse {
	message: string;
}

// ============ QUERIES ============

/**
 * Hook to fetch platform-wide statistics (Admin only)
 *
 * @param options - Additional TanStack Query options
 */
export function usePlatformStats(
	options?: Omit<UseQueryOptions<PlatformStatsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.admin.stats(),
		queryFn: () => api.get<PlatformStatsResponse>('/admin/stats'),
		staleTime: 30 * 1000, // 30 seconds - admin needs fresh data
		...options
	});
}

/**
 * Hook to fetch all users with filters (Admin only)
 *
 * @param filters - Query filters (page, role, search, etc.)
 * @param options - Additional TanStack Query options
 */
export function useUsers(
	filters: UsersFilters = {},
	options?: Omit<UseQueryOptions<UsersResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.admin.userList(filters),
		queryFn: () => api.get<UsersResponse>('/admin/users', filters),
		staleTime: 30 * 1000, // 30 seconds
		...options
	});
}

/**
 * Hook to fetch a single user by ID (Admin only)
 *
 * @param id - User ID
 * @param options - Additional TanStack Query options
 */
export function useUser(
	id: string,
	options?: Omit<UseQueryOptions<UserResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.admin.user(id),
		queryFn: () => api.get<UserResponse>(`/admin/users/${id}`),
		enabled: !!id,
		staleTime: 60 * 1000, // 1 minute
		...options
	});
}

// ============ MUTATIONS ============

/**
 * Hook to update a user (Admin only)
 */
export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
			api.patch<UserResponse>(`/admin/users/${id}`, data),

		onMutate: async ({ id, data }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.admin.user(id) });

			// Snapshot previous value
			const previousUser = queryClient.getQueryData<UserResponse>(
				queryKeys.admin.user(id)
			);

			// Optimistically update
			if (previousUser) {
				queryClient.setQueryData<UserResponse>(queryKeys.admin.user(id), {
					user: { ...previousUser.user, ...data }
				});
			}

			return { previousUser };
		},

		onError: (_error, variables, context) => {
			// Rollback on error
			if (context?.previousUser) {
				queryClient.setQueryData(
					queryKeys.admin.user(variables.id),
					context.previousUser
				);
			}
		},

		onSettled: (_data, _error, variables) => {
			// Refetch to ensure consistency
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(variables.id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

/**
 * Hook to verify an agent (Admin only)
 */
export function useVerifyAgent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) =>
			api.patch<UserResponse>(`/admin/users/${userId}`, { isVerified: true }),

		onSuccess: (data, userId) => {
			// Update cache
			queryClient.setQueryData<UserResponse>(queryKeys.admin.user(userId), data);

			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

/**
 * Hook to unverify an agent (Admin only)
 */
export function useUnverifyAgent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) =>
			api.patch<UserResponse>(`/admin/users/${userId}`, { isVerified: false }),

		onSuccess: (data, userId) => {
			// Update cache
			queryClient.setQueryData<UserResponse>(queryKeys.admin.user(userId), data);

			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

/**
 * Hook to delete a user (soft delete, Admin only)
 */
export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) =>
			api.delete<DeleteUserResponse>(`/admin/users/${userId}`),

		onMutate: async (userId) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.admin.users() });

			// Snapshot previous lists
			const previousUsers = queryClient.getQueriesData<UsersResponse>({
				queryKey: queryKeys.admin.users()
			});

			// Optimistically remove from all lists
			previousUsers.forEach(([key, data]) => {
				if (data) {
					queryClient.setQueryData<UsersResponse>(key, {
						...data,
						users: data.users.filter((u) => u.id !== userId),
						pagination: {
							...data.pagination,
							total: data.pagination.total - 1
						}
					});
				}
			});

			return { previousUsers };
		},

		onError: (_error, _userId, context) => {
			// Rollback on error
			if (context?.previousUsers) {
				context.previousUsers.forEach(([key, data]) => {
					queryClient.setQueryData(key, data);
				});
			}
		},

		onSettled: (_data, _error, userId) => {
			// Remove user detail from cache
			queryClient.removeQueries({ queryKey: queryKeys.admin.user(userId) });

			// Refetch lists and stats
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

/**
 * Hook to change a user's role (Admin only)
 */
export function useChangeUserRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: 'student' | 'agent' | 'owner' | 'admin' }) =>
			api.patch<UserResponse>(`/admin/users/${userId}`, { role }),

		onSuccess: (data, variables) => {
			// Update cache
			queryClient.setQueryData<UserResponse>(queryKeys.admin.user(variables.userId), data);

			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

// ============ CACHE HELPERS ============

/**
 * Invalidate all admin-related caches
 */
export function useInvalidateAdmin() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
	};
}

/**
 * Get cached platform stats without refetching
 */
export function usePlatformStatsFromCache(): PlatformStats | undefined {
	const queryClient = useQueryClient();
	const data = queryClient.getQueryData<PlatformStatsResponse>(queryKeys.admin.stats());
	return data?.stats;
}

/**
 * Prefetch admin dashboard data
 *
 * Call this when navigating to admin dashboard for faster load
 */
export function usePrefetchAdminDashboard() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.admin.stats(),
			queryFn: () => api.get<PlatformStatsResponse>('/admin/stats'),
			staleTime: 30 * 1000
		});

		queryClient.prefetchQuery({
			queryKey: queryKeys.admin.userList({ limit: 20 }),
			queryFn: () => api.get<UsersResponse>('/admin/users', { limit: 20 }),
			staleTime: 30 * 1000
		});

		queryClient.prefetchQuery({
			queryKey: queryKeys.payments.pending({ limit: 10 }),
			queryFn: () => api.get('/payments/proofs/pending', { limit: 10 }),
			staleTime: 15 * 1000
		});
	};
}

/**
 * Prefetch a user for instant viewing
 */
export function usePrefetchUser() {
	const queryClient = useQueryClient();

	return (id: string) => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.admin.user(id),
			queryFn: () => api.get<UserResponse>(`/admin/users/${id}`),
			staleTime: 60 * 1000
		});
	};
}
