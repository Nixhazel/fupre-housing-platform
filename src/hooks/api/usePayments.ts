import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions
} from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import type { PaymentProof, PaginationMeta } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

/**
 * Payments Query Hooks
 *
 * TanStack Query hooks for payment proof operations
 */

// ============ TYPES ============

export interface PaymentProofsFilters {
	page?: number;
	limit?: number;
	status?: 'pending' | 'approved' | 'rejected';
	listingId?: string;
	[key: string]: unknown;
}

export interface MyPaymentProofsResponse {
	proofs: PaymentProof[];
	pagination: PaginationMeta;
}

export interface PendingProofsResponse {
	proofs: PaymentProof[];
	pagination: PaginationMeta;
}

export interface PaymentProofResponse {
	proof: PaymentProof;
}

export interface SubmitPaymentProofData {
	listingId: string;
	amount: number;
	method: 'bank_transfer' | 'ussd' | 'pos';
	reference: string;
	imageUrl: string;
}

export interface ReviewPaymentProofData {
	action: 'approve' | 'reject';
	rejectionReason?: string;
}

export interface UnlockStatusResponse {
	isUnlocked: boolean;
	unlockedAt?: string;
}

// ============ QUERIES ============

/**
 * Hook to fetch current user's payment proofs
 *
 * @param filters - Query filters (page, status, listingId)
 * @param options - Additional TanStack Query options
 */
export function useMyPaymentProofs(
	filters: PaymentProofsFilters = {},
	options?: Omit<UseQueryOptions<MyPaymentProofsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.payments.myProofs(filters),
		queryFn: () => api.get<MyPaymentProofsResponse>('/payments/proofs', filters),
		staleTime: 30 * 1000, // 30 seconds
		...options
	});
}

/**
 * Hook to fetch pending payment proofs (Admin only)
 *
 * @param filters - Query filters (page, limit)
 * @param options - Additional TanStack Query options
 */
export function usePendingPaymentProofs(
	filters: PaymentProofsFilters = {},
	options?: Omit<UseQueryOptions<PendingProofsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.payments.pending(filters),
		queryFn: () => api.get<PendingProofsResponse>('/payments/proofs/pending', filters),
		staleTime: 15 * 1000, // 15 seconds - more frequent updates for admins
		...options
	});
}

/**
 * Hook to fetch a single payment proof by ID
 *
 * @param id - Payment proof ID
 * @param options - Additional TanStack Query options
 */
export function usePaymentProof(
	id: string,
	options?: Omit<UseQueryOptions<PaymentProofResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.payments.detail(id),
		queryFn: () => api.get<PaymentProofResponse>(`/payments/proofs/${id}`),
		enabled: !!id,
		staleTime: 60 * 1000, // 1 minute
		...options
	});
}

/**
 * Hook to check if user has unlocked a listing
 *
 * @param listingId - Listing ID to check
 * @param options - Additional TanStack Query options
 */
export function useUnlockStatus(
	listingId: string,
	options?: Omit<UseQueryOptions<UnlockStatusResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.payments.forListing(listingId),
		queryFn: () => api.get<UnlockStatusResponse>(`/payments/unlock/${listingId}`),
		enabled: !!listingId,
		staleTime: 5 * 60 * 1000, // 5 minutes - unlock status doesn't change often
		...options
	});
}

// ============ MUTATIONS ============

/**
 * Hook to submit a payment proof
 */
export function useSubmitPaymentProof() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SubmitPaymentProofData) =>
			api.post<PaymentProofResponse>('/payments/proofs', data),

		onSuccess: (_data, variables) => {
			// Invalidate user's proofs list
			queryClient.invalidateQueries({ queryKey: queryKeys.payments.myProofs() });

			// Invalidate the specific listing's unlock status
			queryClient.invalidateQueries({
				queryKey: queryKeys.payments.forListing(variables.listingId)
			});
		}
	});
}

/**
 * Hook to approve a payment proof (Admin only)
 */
export function useApprovePaymentProof() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (proofId: string) =>
			api.patch<PaymentProofResponse>(`/payments/proofs/${proofId}`, {
				action: 'approve'
			}),

		onSuccess: (data, proofId) => {
			// Update cache with new status
			queryClient.setQueryData<PaymentProofResponse>(
				queryKeys.payments.detail(proofId),
				data
			);

			// Invalidate pending list
			queryClient.invalidateQueries({ queryKey: queryKeys.payments.pending() });

			// Invalidate admin stats
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

/**
 * Hook to reject a payment proof (Admin only)
 */
export function useRejectPaymentProof() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ proofId, reason }: { proofId: string; reason: string }) =>
			api.patch<PaymentProofResponse>(`/payments/proofs/${proofId}`, {
				action: 'reject',
				rejectionReason: reason
			}),

		onSuccess: (data, variables) => {
			// Update cache with new status
			queryClient.setQueryData<PaymentProofResponse>(
				queryKeys.payments.detail(variables.proofId),
				data
			);

			// Invalidate pending list
			queryClient.invalidateQueries({ queryKey: queryKeys.payments.pending() });

			// Invalidate admin stats
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

/**
 * Hook to review a payment proof (approve or reject)
 *
 * Combined hook for flexibility
 */
export function useReviewPaymentProof() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ proofId, data }: { proofId: string; data: ReviewPaymentProofData }) =>
			api.patch<PaymentProofResponse>(`/payments/proofs/${proofId}`, data),

		onSuccess: (data, variables) => {
			// Update cache with new status
			queryClient.setQueryData<PaymentProofResponse>(
				queryKeys.payments.detail(variables.proofId),
				data
			);

			// Invalidate pending list
			queryClient.invalidateQueries({ queryKey: queryKeys.payments.pending() });

			// Invalidate admin stats
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		}
	});
}

// ============ CACHE HELPERS ============

/**
 * Invalidate all payment-related caches
 */
export function useInvalidatePayments() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
	};
}

/**
 * Get pending proofs count from cache
 */
export function usePendingProofsCount(): number {
	const queryClient = useQueryClient();
	const data = queryClient.getQueryData<PendingProofsResponse>(
		queryKeys.payments.pending()
	);
	return data?.pagination?.total ?? 0;
}

/**
 * Prefetch a payment proof for instant viewing
 */
export function usePrefetchPaymentProof() {
	const queryClient = useQueryClient();

	return (id: string) => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.payments.detail(id),
			queryFn: () => api.get<PaymentProofResponse>(`/payments/proofs/${id}`),
			staleTime: 60 * 1000
		});
	};
}
