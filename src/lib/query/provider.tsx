'use client';

import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from './client';

interface QueryProviderProps {
	children: ReactNode;
}

/**
 * Query Provider
 *
 * Wraps the application with TanStack Query's QueryClientProvider.
 * - Creates new QueryClient per request on server (SSR safety)
 * - Reuses same QueryClient on browser
 * - Includes DevTools in development only
 */
export function QueryProvider({ children }: QueryProviderProps) {
	// Create QueryClient once per component instance
	// Using useState ensures it's created only once on mount
	const [queryClient] = useState(() => createQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === 'development' && (
				<ReactQueryDevtools
					initialIsOpen={false}
					buttonPosition="bottom-left"
				/>
			)}
		</QueryClientProvider>
	);
}

