import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/types';

/**
 * QueryClient Configuration
 *
 * Global TanStack Query client with optimized defaults for:
 * - Mobile-first experience (shorter stale times)
 * - Serverless backend (connection pooling)
 * - User experience (smart refetching)
 */

/**
 * Determine if an error is an authentication error
 */
function isAuthError(error: unknown): boolean {
	// Check ApiError type first
	if (error instanceof ApiError) {
		return error.isAuthError;
	}
	
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		return (
			message.includes('401') ||
			message.includes('unauthorized') ||
			message.includes('authentication')
		);
	}
	return false;
}

/**
 * Determine if an error is a forbidden error
 */
function isForbiddenError(error: unknown): boolean {
	// Check ApiError type first
	if (error instanceof ApiError) {
		return error.isForbiddenError;
	}

	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		return message.includes('403') || message.includes('forbidden');
	}
	return false;
}

/**
 * Determine if an error is a validation error
 */
function isValidationError(error: unknown): boolean {
	if (error instanceof ApiError) {
		return error.isValidationError;
	}
	return false;
}

/**
 * Create a new QueryClient instance
 *
 * Creates fresh instance for SSR, reuses for client
 */
export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Data is fresh for 30 seconds
				staleTime: 30 * 1000,

				// Keep unused data in cache for 10 minutes
				gcTime: 10 * 60 * 1000,

				// Retry logic
				retry: (failureCount, error) => {
					// Don't retry auth errors
					if (isAuthError(error) || isForbiddenError(error)) {
						return false;
					}
					// Retry up to 3 times for other errors
					return failureCount < 3;
				},

				// Exponential backoff for retries
				retryDelay: (attemptIndex) =>
					Math.min(1000 * 2 ** attemptIndex, 30000),

				// Refetch behavior
				refetchOnWindowFocus: true,
				refetchOnReconnect: true,
				refetchOnMount: true,

				// Network mode
				networkMode: 'offlineFirst'
			},
			mutations: {
				// Retry logic for mutations
				retry: (failureCount, error) => {
					// Never retry auth, validation, or conflict errors
					if (
						isAuthError(error) ||
						isForbiddenError(error) ||
						isValidationError(error)
					) {
						return false;
					}

					if (error instanceof ApiError) {
						// Never retry conflict errors
						if (error.isConflictError) return false;
					}

					if (error instanceof Error) {
						const message = error.message.toLowerCase();
						if (
							message.includes('conflict') ||
							message.includes('already exists')
						) {
							return false;
						}
					}
					return failureCount < 2;
				},

				networkMode: 'offlineFirst'
			}
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				// Log errors in development
				if (process.env.NODE_ENV === 'development') {
					console.error(`[Query Error] ${query.queryKey}:`, error);
				}
			}
		}),
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, mutation) => {
				// Log errors in development
				if (process.env.NODE_ENV === 'development') {
					console.error(`[Mutation Error] ${mutation.options.mutationKey}:`, error);
				}
			}
		})
	});
}

/**
 * Singleton QueryClient for browser
 *
 * Server always gets a new instance, browser reuses
 */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
	// Server: always create new
	if (typeof window === 'undefined') {
		return createQueryClient();
	}

	// Browser: reuse existing
	if (!browserQueryClient) {
		browserQueryClient = createQueryClient();
	}

	return browserQueryClient;
}

