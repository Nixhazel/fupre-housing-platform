/**
 * Query Key Factory
 *
 * Centralized, type-safe query keys for cache management.
 *
 * Convention:
 * - Keys are arrays: ['domain', 'entity', 'action/id', filters]
 * - Hierarchical for granular invalidation
 *
 * Examples:
 * - queryKeys.auth.me()                    → ['auth', 'me']
 * - queryKeys.listings.list({ page: 1 })  → ['listings', 'list', { page: 1 }]
 * - queryKeys.listings.detail('123')       → ['listings', 'detail', '123']
 */

export const queryKeys = {
	// ========== AUTH ==========
	auth: {
		all: ['auth'] as const,
		me: () => [...queryKeys.auth.all, 'me'] as const
	},

	// ========== LISTINGS ==========
	listings: {
		all: ['listings'] as const,
		lists: () => [...queryKeys.listings.all, 'list'] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.listings.lists(), filters] as const,
		details: () => [...queryKeys.listings.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.listings.details(), id] as const,
		agent: (agentId: string) =>
			[...queryKeys.listings.all, 'agent', agentId] as const,
		saved: () => [...queryKeys.listings.all, 'saved'] as const,
		unlocked: () => [...queryKeys.listings.all, 'unlocked'] as const
	},

	// ========== REVIEWS ==========
	reviews: {
		all: ['reviews'] as const,
		forListing: (listingId: string) =>
			[...queryKeys.reviews.all, 'listing', listingId] as const
	},

	// ========== PAYMENTS ==========
	payments: {
		all: ['payments'] as const,
		proofs: () => [...queryKeys.payments.all, 'proofs'] as const,
		myProofs: (filters?: Record<string, unknown>) =>
			filters
				? [...queryKeys.payments.proofs(), 'me', filters] as const
				: ([...queryKeys.payments.proofs(), 'me'] as const),
		pending: (filters?: Record<string, unknown>) =>
			filters
				? [...queryKeys.payments.proofs(), 'pending', filters] as const
				: ([...queryKeys.payments.proofs(), 'pending'] as const),
		detail: (id: string) => [...queryKeys.payments.proofs(), id] as const,
		forListing: (listingId: string) =>
			[...queryKeys.payments.proofs(), 'listing', listingId] as const
	},

	// ========== ROOMMATES ==========
	roommates: {
		all: ['roommates'] as const,
		lists: () => [...queryKeys.roommates.all, 'list'] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.roommates.lists(), filters] as const,
		details: () => [...queryKeys.roommates.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.roommates.details(), id] as const,
		mine: (filters?: Record<string, unknown>) =>
			filters
				? [...queryKeys.roommates.all, 'mine', filters] as const
				: ([...queryKeys.roommates.all, 'mine'] as const),
		saved: () => [...queryKeys.roommates.all, 'saved'] as const
	},

	// ========== AGENT ==========
	agent: {
		all: ['agent'] as const,
		stats: () => [...queryKeys.agent.all, 'stats'] as const,
		earnings: (months?: number) =>
			months
				? [...queryKeys.agent.all, 'earnings', { months }] as const
				: ([...queryKeys.agent.all, 'earnings'] as const),
		listings: (filters?: Record<string, unknown>) =>
			filters
				? [...queryKeys.agent.all, 'listings', filters] as const
				: ([...queryKeys.agent.all, 'listings'] as const)
	},

	// ========== ADMIN ==========
	admin: {
		all: ['admin'] as const,
		stats: () => [...queryKeys.admin.all, 'stats'] as const,
		users: () => [...queryKeys.admin.all, 'users'] as const,
		userList: (filters: Record<string, unknown>) =>
			[...queryKeys.admin.users(), filters] as const,
		user: (id: string) => [...queryKeys.admin.users(), id] as const
	}
} as const;

/**
 * Type helper for query key inference
 */
export type QueryKeys = typeof queryKeys;

