'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToAuthEvents } from '@/lib/auth/events';
import { queryKeys } from '@/lib/query/keys';
import { toast } from 'sonner';

/**
 * AuthGuard Component
 *
 * Global auth event listener that:
 * - Handles session expiry with redirect to login
 * - Handles forbidden access with notification
 * - Clears cache appropriately on auth state changes
 * - Syncs auth state across tabs (via visibility change)
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();

	/**
	 * Handle session expiration
	 */
	const handleSessionExpired = useCallback(
		(detail: { returnUrl?: string }) => {
			// Clear auth cache
			queryClient.setQueryData(queryKeys.auth.me(), null);
			queryClient.removeQueries({ queryKey: queryKeys.auth.all });

			// Show notification
			toast.error('Your session has expired. Please log in again.', {
				id: 'session-expired',
				duration: 5000
			});

			// Redirect to login with return URL
			const returnUrl = detail.returnUrl || pathname;
			const encodedReturnUrl = encodeURIComponent(returnUrl);
			router.push(`/auth/login?returnUrl=${encodedReturnUrl}`);
		},
		[queryClient, router, pathname]
	);

	/**
	 * Handle forbidden access
	 */
	const handleForbidden = useCallback((detail: { resource?: string }) => {
		// Show notification
		toast.error('You do not have permission to access this resource.', {
			id: 'forbidden',
			duration: 5000,
			description: detail.resource
				? `Resource: ${detail.resource}`
				: undefined
		});
	}, []);

	/**
	 * Handle user logout
	 */
	const handleLogout = useCallback(
		(detail: { reason?: 'user' | 'expired' | 'error' }) => {
			// Clear all sensitive cached data
			queryClient.removeQueries({ queryKey: queryKeys.listings.saved() });
			queryClient.removeQueries({ queryKey: queryKeys.listings.unlocked() });
			queryClient.removeQueries({ queryKey: queryKeys.payments.all });
			queryClient.removeQueries({ queryKey: queryKeys.roommates.mine() });
			queryClient.removeQueries({ queryKey: queryKeys.agent.all });
			queryClient.removeQueries({ queryKey: queryKeys.admin.all });

			if (detail.reason === 'user') {
				toast.success('You have been logged out successfully.', {
					id: 'logout-success'
				});
			}
		},
		[queryClient]
	);

	/**
	 * Handle successful login
	 */
	const handleLogin = useCallback(
		(detail: { userId: string; role: string }) => {
			// Invalidate any stale data from previous session
			queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });

			if (process.env.NODE_ENV === 'development') {
				console.log(`[AuthGuard] User logged in: ${detail.userId} (${detail.role})`);
			}
		},
		[queryClient]
	);

	/**
	 * Subscribe to auth events
	 */
	useEffect(() => {
		const unsubscribe = subscribeToAuthEvents({
			'auth:session-expired': handleSessionExpired,
			'auth:forbidden': handleForbidden,
			'auth:logout': handleLogout,
			'auth:login': handleLogin
		});

		return unsubscribe;
	}, [handleSessionExpired, handleForbidden, handleLogout, handleLogin]);

	/**
	 * Handle storage events for cross-tab sync
	 */
	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			// Listen for logout signal from other tabs
			if (event.key === 'auth:logout' && event.newValue) {
				queryClient.setQueryData(queryKeys.auth.me(), null);
				queryClient.clear();
				router.push('/auth/login');
			}
		};

		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, [queryClient, router]);

	return <>{children}</>;
}

