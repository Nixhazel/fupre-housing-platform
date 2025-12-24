import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions
} from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import type {
	SessionUser,
	LoginResponse,
	RegisterResponse
} from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import { dispatchAuthEvent, subscribeToAuthEvents } from '@/lib/auth/events';

/**
 * Auth Query Hooks
 *
 * TanStack Query hooks for authentication operations
 */

// ============ TYPES ============

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	name: string;
	email: string;
	password: string;
	phone: string;
	role: 'student' | 'agent' | 'owner';
	matricNumber?: string;
}

export interface ForgotPasswordData {
	email: string;
}

export interface ResetPasswordData {
	token: string;
	password: string;
}

export interface VerifyEmailData {
	token: string;
}

export interface UpdateProfileData {
	name?: string;
	phone?: string;
	avatarUrl?: string;
}

export interface ChangePasswordData {
	currentPassword: string;
	newPassword: string;
}

export interface MessageResponse {
	message: string;
}

// ============ QUERIES ============

/**
 * Hook to get the current authenticated user
 *
 * Includes:
 * - Session refresh on visibility change
 * - Auth event subscription for cache sync
 *
 * @param options - Additional TanStack Query options
 */
export function useCurrentUser(
	options?: Omit<UseQueryOptions<SessionUser, ApiError>, 'queryKey' | 'queryFn'>
) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: queryKeys.auth.me(),
		queryFn: () => api.get<SessionUser>('/auth/me'),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
		retry: (failureCount, error) => {
			// Don't retry on auth errors
			if ((error as ApiError).status === 401) return false;
			return failureCount < 2;
		},
		...options
	});

	// Subscribe to auth events for cache sync
	useEffect(() => {
		const unsubscribe = subscribeToAuthEvents({
			'auth:session-expired': () => {
				// Clear user cache on session expiry
				queryClient.setQueryData(queryKeys.auth.me(), null);
				queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
			},
			'auth:logout': () => {
				// Clear all caches on logout
				queryClient.clear();
			}
		});

		return unsubscribe;
	}, [queryClient]);

	// Refetch on visibility change (tab focus)
	// Note: Only refetch if data exists (user was logged in)
	const refetch = query.refetch;
	const hasData = !!query.data;

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible' && hasData) {
				// Refetch user data when tab becomes visible
				refetch();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [refetch, hasData]);

	return {
		...query,
		// Convenience accessors
		isAuthenticated: !!query.data && !query.isError
	};
}

/**
 * Hook to check if user is authenticated
 *
 * Returns boolean and doesn't throw on 401
 */
export function useIsAuthenticated() {
	const { data, isLoading, error } = useCurrentUser({
		retry: false
	});

	return {
		isAuthenticated: !!data && !error,
		isLoading,
		user: data
	};
}

// ============ MUTATIONS ============

/**
 * Hook to log in a user
 *
 * Includes comprehensive cache invalidation for role-specific data
 */
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (credentials: LoginCredentials) =>
			api.post<LoginResponse>('/auth/login', credentials),

		onSuccess: (data) => {
			// Update cached user data immediately
			queryClient.setQueryData(queryKeys.auth.me(), data.user);

			// Dispatch login event for other components
			dispatchAuthEvent('auth:login', {
				userId: data.user.id,
				role: data.user.role
			});

			// Invalidate all user-specific data to refetch with new auth state
			// This ensures no stale data from previous session
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.saved() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.unlocked()
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.roommates.mine() });

			// Invalidate role-specific data
			if (data.user.role === 'agent') {
				queryClient.invalidateQueries({ queryKey: queryKeys.agent.all });
			}
			if (data.user.role === 'admin') {
				queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
			}
		}
	});
}

/**
 * Hook to register a new user
 *
 * Sets up fresh cache state for new user
 */
export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: RegisterData) =>
			api.post<RegisterResponse>('/auth/register', data),

		onSuccess: (data) => {
			// Update cached user data
			queryClient.setQueryData(queryKeys.auth.me(), data.user);

			// Dispatch login event (registration = automatic login)
			dispatchAuthEvent('auth:login', {
				userId: data.user.id,
				role: data.user.role
			});
		}
	});
}

/**
 * Hook to log out the current user
 *
 * Clears all cached data to prevent data leakage
 */
export function useLogout() {
	const queryClient = useQueryClient();

	const clearAllCaches = useCallback(() => {
		// Clear user data first
		queryClient.setQueryData(queryKeys.auth.me(), null);

		// Remove all queries from cache
		queryClient.removeQueries({ queryKey: queryKeys.auth.all });
		queryClient.removeQueries({ queryKey: queryKeys.listings.saved() });
		queryClient.removeQueries({ queryKey: queryKeys.listings.unlocked() });
		queryClient.removeQueries({ queryKey: queryKeys.payments.all });
		queryClient.removeQueries({ queryKey: queryKeys.roommates.mine() });
		queryClient.removeQueries({ queryKey: queryKeys.agent.all });
		queryClient.removeQueries({ queryKey: queryKeys.admin.all });

		// Clear remaining queries (public data can stay but mark as stale)
		queryClient.invalidateQueries();

		// Dispatch logout event
		dispatchAuthEvent('auth:logout', { reason: 'user' });

		// Signal other tabs about logout via localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('auth:logout', Date.now().toString());
			localStorage.removeItem('auth:logout');
		}
	}, [queryClient]);

	return useMutation({
		mutationFn: () => api.post<MessageResponse>('/auth/logout'),

		onSuccess: () => {
			clearAllCaches();
		},

		onError: () => {
			// Even on error, clear cache (user might be logged out server-side)
			clearAllCaches();
		}
	});
}

/**
 * Hook to request a password reset email
 */
export function useForgotPassword() {
	return useMutation({
		mutationFn: (data: ForgotPasswordData) =>
			api.post<MessageResponse>('/auth/forgot-password', data)
	});
}

/**
 * Hook to reset password using token
 */
export function useResetPassword() {
	return useMutation({
		mutationFn: (data: ResetPasswordData) =>
			api.post<MessageResponse>('/auth/reset-password', data)
	});
}

/**
 * Hook to verify email using token
 */
export function useVerifyEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: VerifyEmailData) =>
			api.post<MessageResponse>('/auth/verify-email', data),

		onSuccess: () => {
			// Refresh user data to get updated verification status
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
		}
	});
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateProfileData) =>
			api.patch<{ user: SessionUser }>('/auth/me', data),

		onMutate: async (newData) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.auth.me() });

			// Snapshot previous value
			const previousUser = queryClient.getQueryData<SessionUser>(
				queryKeys.auth.me()
			);

			// Optimistically update
			if (previousUser) {
				queryClient.setQueryData<SessionUser>(queryKeys.auth.me(), {
					...previousUser,
					...newData
				});
			}

			return { previousUser };
		},

		onError: (_error, _variables, context) => {
			// Rollback on error
			if (context?.previousUser) {
				queryClient.setQueryData(queryKeys.auth.me(), context.previousUser);
			}
		},

		onSettled: () => {
			// Refetch to ensure consistency
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
		}
	});
}

/**
 * Hook to change password
 */
export function useChangePassword() {
	return useMutation({
		mutationFn: (data: ChangePasswordData) =>
			api.patch<MessageResponse>('/auth/change-password', data)
	});
}

// ============ CACHE HELPERS ============

/**
 * Get cached user data without refetching
 */
export function useUserFromCache(): SessionUser | undefined {
	const queryClient = useQueryClient();
	return queryClient.getQueryData<SessionUser>(queryKeys.auth.me());
}

/**
 * Invalidate auth cache (force refetch)
 */
export function useInvalidateAuth() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
	};
}

/**
 * Clear all auth-related cache
 */
export function useClearAuthCache() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.removeQueries({ queryKey: queryKeys.auth.all });
	};
}
