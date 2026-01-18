import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions
} from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import { ApiError } from '@/lib/api/types';

/**
 * Reviews Query Hooks
 *
 * TanStack Query hooks for review operations
 */

// ============ TYPES ============

export interface ReviewUser {
	id: string;
	userName: string;
	userAvatar?: string;
}

export interface Review {
	id: string;
	userId: string;
	userName: string;
	userAvatar?: string;
	listingId: string;
	rating: number;
	comment: string;
	createdAt: string;
	updatedAt: string;
}

export interface ReviewsResponse {
	reviews: Review[];
	averageRating: number;
	totalReviews: number;
	userReview: Review | null;
	canReview: boolean;
	hasReviewed: boolean;
}

export interface CreateReviewData {
	rating: number;
	comment: string;
}

export interface UpdateReviewData {
	rating?: number;
	comment?: string;
}

export interface ReviewResponse {
	review: Review;
}

export interface DeleteReviewResponse {
	message: string;
}

// ============ QUERIES ============

/**
 * Hook to fetch reviews for a listing
 *
 * @param listingId - ID of the listing
 * @param options - Additional TanStack Query options
 */
export function useListingReviews(
	listingId: string,
	options?: Omit<UseQueryOptions<ReviewsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: queryKeys.reviews.forListing(listingId),
		queryFn: () => api.get<ReviewsResponse>(`/listings/${listingId}/reviews`),
		enabled: !!listingId,
		staleTime: 60 * 1000, // 1 minute
		...options
	});
}

// ============ MUTATIONS ============

/**
 * Hook to create a review for a listing
 */
export function useCreateReview(listingId: string) {
	const queryClient = useQueryClient();

	return useMutation<ReviewResponse, ApiError, CreateReviewData>({
		mutationFn: (data) =>
			api.post<ReviewResponse>(`/listings/${listingId}/reviews`, data),
		onSuccess: () => {
			// Invalidate reviews for this listing
			queryClient.invalidateQueries({
				queryKey: queryKeys.reviews.forListing(listingId)
			});
			// Invalidate listing detail to update the rating display
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.detail(listingId)
			});
			// Invalidate listings lists to update ratings
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.lists()
			});
		}
	});
}

/**
 * Hook to update a review
 */
export function useUpdateReview(listingId: string, reviewId: string) {
	const queryClient = useQueryClient();

	return useMutation<ReviewResponse, ApiError, UpdateReviewData>({
		mutationFn: (data) =>
			api.patch<ReviewResponse>(
				`/listings/${listingId}/reviews/${reviewId}`,
				data
			),
		onSuccess: () => {
			// Invalidate reviews for this listing
			queryClient.invalidateQueries({
				queryKey: queryKeys.reviews.forListing(listingId)
			});
			// Invalidate listing detail to update the rating display
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.detail(listingId)
			});
			// Invalidate listings lists to update ratings
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.lists()
			});
		}
	});
}

/**
 * Hook to delete a review
 */
export function useDeleteReview(listingId: string, reviewId: string) {
	const queryClient = useQueryClient();

	return useMutation<DeleteReviewResponse, ApiError, void>({
		mutationFn: () =>
			api.delete<DeleteReviewResponse>(
				`/listings/${listingId}/reviews/${reviewId}`
			),
		onSuccess: () => {
			// Invalidate reviews for this listing
			queryClient.invalidateQueries({
				queryKey: queryKeys.reviews.forListing(listingId)
			});
			// Invalidate listing detail to update the rating display
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.detail(listingId)
			});
			// Invalidate listings lists to update ratings
			queryClient.invalidateQueries({
				queryKey: queryKeys.listings.lists()
			});
		}
	});
}

