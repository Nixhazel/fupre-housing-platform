'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/api/useAuth';
import type { SessionUser } from '@/lib/api/types';
import { AuthGuard } from './AuthGuard';

/**
 * Auth Context
 *
 * Provides authentication state throughout the app using TanStack Query.
 * Includes AuthGuard for global auth event handling.
 */

interface AuthContextValue {
	user: SessionUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isError: boolean;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	isError: false
});

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: user, isLoading, isError, isAuthenticated } = useCurrentUser({
		retry: false,
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	return (
		<AuthContext.Provider
			value={{
				user: user ?? null,
				isAuthenticated,
				isLoading,
				isError
			}}>
			<AuthGuard>{children}</AuthGuard>
		</AuthContext.Provider>
	);
}
