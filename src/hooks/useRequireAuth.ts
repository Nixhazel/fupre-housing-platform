'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from './api/useAuth';
import type { SessionUser } from '@/lib/api/types';

/**
 * Hook options for useRequireAuth
 */
interface UseRequireAuthOptions {
	/** Required role(s) - user must have one of these */
	roles?: SessionUser['role'][];
	/** Redirect URL if not authenticated (default: /auth/login) */
	loginUrl?: string;
	/** Redirect URL if authenticated but not authorized (default: /) */
	unauthorizedUrl?: string;
	/** Callback when auth check fails */
	onAuthFail?: (reason: 'unauthenticated' | 'unauthorized') => void;
}

/**
 * Hook result for useRequireAuth
 */
interface UseRequireAuthResult {
	/** The authenticated user (undefined while loading or if not authenticated) */
	user: SessionUser | undefined;
	/** Whether authentication check is in progress */
	isLoading: boolean;
	/** Whether the user is authenticated */
	isAuthenticated: boolean;
	/** Whether the user is authorized (has required role) */
	isAuthorized: boolean;
	/** Manually trigger re-check */
	refetch: () => void;
}

/**
 * Hook to require authentication and optionally specific roles
 *
 * Automatically redirects to login if not authenticated,
 * or to unauthorized page if role doesn't match.
 *
 * @example
 * // Require any authenticated user
 * const { user, isLoading } = useRequireAuth();
 *
 * @example
 * // Require admin role
 * const { user, isLoading } = useRequireAuth({ roles: ['admin'] });
 *
 * @example
 * // Require agent or admin role
 * const { user, isLoading } = useRequireAuth({ roles: ['agent', 'admin'] });
 */
export function useRequireAuth(
	options: UseRequireAuthOptions = {}
): UseRequireAuthResult {
	const {
		roles,
		loginUrl = '/auth/login',
		unauthorizedUrl = '/',
		onAuthFail
	} = options;

	const router = useRouter();
	const pathname = usePathname();
	const { data: user, isLoading, isError, refetch } = useCurrentUser({
		retry: false
	});

	const isAuthenticated = !!user && !isError;
	const isAuthorized = isAuthenticated && (!roles || roles.includes(user!.role));

	const handleAuthFail = useCallback(
		(reason: 'unauthenticated' | 'unauthorized') => {
			if (onAuthFail) {
				onAuthFail(reason);
			}
		},
		[onAuthFail]
	);

	useEffect(() => {
		// Wait for loading to complete
		if (isLoading) return;

		// Not authenticated - redirect to login
		if (!isAuthenticated) {
			handleAuthFail('unauthenticated');
			const returnUrl = encodeURIComponent(pathname);
			router.replace(`${loginUrl}?returnUrl=${returnUrl}`);
			return;
		}

		// Authenticated but not authorized - redirect to unauthorized page
		if (!isAuthorized) {
			handleAuthFail('unauthorized');
			router.replace(unauthorizedUrl);
			return;
		}
	}, [
		isLoading,
		isAuthenticated,
		isAuthorized,
		router,
		pathname,
		loginUrl,
		unauthorizedUrl,
		handleAuthFail
	]);

	return {
		user,
		isLoading,
		isAuthenticated,
		isAuthorized,
		refetch
	};
}

/**
 * Hook to check authentication without redirecting
 *
 * Useful for conditional UI rendering
 */
export function useOptionalAuth() {
	const { data: user, isLoading, isError, refetch } = useCurrentUser({
		retry: false
	});

	return {
		user,
		isLoading,
		isAuthenticated: !!user && !isError,
		isError,
		refetch
	};
}

/**
 * Hook to require a specific role
 *
 * Convenience wrapper around useRequireAuth
 */
export function useRequireRole(role: SessionUser['role'] | SessionUser['role'][]) {
	const roles = Array.isArray(role) ? role : [role];
	return useRequireAuth({ roles });
}

/**
 * Hook to require admin access
 */
export function useRequireAdmin() {
	return useRequireRole('admin');
}

/**
 * Hook to require agent access
 */
export function useRequireAgent() {
	return useRequireRole(['agent', 'admin']);
}

/**
 * Hook to require student access
 */
export function useRequireStudent() {
	return useRequireRole('student');
}

