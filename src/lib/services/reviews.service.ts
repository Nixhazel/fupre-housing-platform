import mongoose from 'mongoose';
import connectDB from '@/lib/db/connect';
import Review, { type IReview } from '@/lib/db/models/Review';
import Listing from '@/lib/db/models/Listing';
import User from '@/lib/db/models/User';
import type { CreateReviewInput, UpdateReviewInput } from '@/lib/validators/reviews.server';

/**
 * Reviews Service
 *
 * Business logic for review operations
 */

/**
 * Public review response type
 */
export interface PublicReview {
	id: string;
	userId: string;
	userName: string;
	userAvatar?: string;
	listingId: string;
	rating: number;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Reviews list response
 */
export interface ReviewsResponse {
	reviews: PublicReview[];
	averageRating: number;
	totalReviews: number;
}

/**
 * Convert Mongoose document to public review object
 */
function toPublicReview(review: IReview): PublicReview {
	const user = review.userId as unknown as { _id: mongoose.Types.ObjectId; name: string; avatarUrl?: string };
	
	return {
		id: review._id.toString(),
		userId: user._id?.toString() || review.userId.toString(),
		userName: user.name || 'Anonymous',
		userAvatar: user.avatarUrl,
		listingId: review.listingId.toString(),
		rating: review.rating,
		comment: review.comment,
		createdAt: review.createdAt,
		updatedAt: review.updatedAt
	};
}

/**
 * Update listing's rating after review changes
 */
async function updateListingRating(listingId: string): Promise<void> {
	const { average, count } = await Review.getAverageRating(listingId);
	
	await Listing.findByIdAndUpdate(listingId, {
		rating: average,
		reviewsCount: count
	});
}

/**
 * Check if user can review a listing (must have unlocked it)
 */
export async function canUserReview(
	userId: string,
	listingId: string
): Promise<{ canReview: boolean; reason?: string; hasReviewed: boolean }> {
	await connectDB();

	// Check if user exists
	const user = await User.findActiveById(userId);
	if (!user) {
		return { canReview: false, reason: 'User not found', hasReviewed: false };
	}

	// Check if listing exists
	const listing = await Listing.findActiveById(listingId);
	if (!listing) {
		return { canReview: false, reason: 'Listing not found', hasReviewed: false };
	}

	// Check if user has unlocked the listing
	const hasUnlocked = user.unlockedListingIds.some(
		(id) => id.toString() === listingId
	);
	if (!hasUnlocked) {
		return { canReview: false, reason: 'You must unlock this listing before reviewing', hasReviewed: false };
	}

	// Check if user has already reviewed
	const existingReview = await Review.findUserReviewForListing(userId, listingId);
	if (existingReview) {
		return { canReview: false, reason: 'You have already reviewed this listing', hasReviewed: true };
	}

	return { canReview: true, hasReviewed: false };
}

/**
 * Create a new review
 */
export async function createReview(
	userId: string,
	listingId: string,
	data: CreateReviewInput
): Promise<PublicReview> {
	await connectDB();

	// Verify user can review
	const { canReview, reason } = await canUserReview(userId, listingId);
	if (!canReview) {
		throw new Error(reason || 'Cannot create review');
	}

	// Create review
	const review = await Review.create({
		userId: new mongoose.Types.ObjectId(userId),
		listingId: new mongoose.Types.ObjectId(listingId),
		rating: data.rating,
		comment: data.comment
	});

	// Update listing's average rating
	await updateListingRating(listingId);

	// Populate user info
	await review.populate('userId', 'name avatarUrl');

	return toPublicReview(review);
}

/**
 * Get all reviews for a listing
 */
export async function getListingReviews(listingId: string): Promise<ReviewsResponse> {
	await connectDB();

	// Verify listing exists
	const listing = await Listing.findActiveById(listingId);
	if (!listing) {
		throw new Error('Listing not found');
	}

	// Get reviews
	const reviews = await Review.findByListing(listingId);

	// Get stats
	const { average, count } = await Review.getAverageRating(listingId);

	return {
		reviews: reviews.map(toPublicReview),
		averageRating: average,
		totalReviews: count
	};
}

/**
 * Get a user's review for a specific listing
 */
export async function getUserReviewForListing(
	userId: string,
	listingId: string
): Promise<PublicReview | null> {
	await connectDB();

	const review = await Review.findUserReviewForListing(userId, listingId);
	if (!review) {
		return null;
	}

	await review.populate('userId', 'name avatarUrl');
	return toPublicReview(review);
}

/**
 * Update a review
 */
export async function updateReview(
	reviewId: string,
	userId: string,
	data: UpdateReviewInput
): Promise<PublicReview> {
	await connectDB();

	// Find review
	const review = await Review.findActiveById(reviewId);
	if (!review) {
		throw new Error('Review not found');
	}

	// Verify ownership
	if (review.userId.toString() !== userId) {
		throw new Error('You do not have permission to update this review');
	}

	// Update fields
	if (data.rating !== undefined) {
		review.rating = data.rating;
	}
	if (data.comment !== undefined) {
		review.comment = data.comment;
	}

	await review.save();

	// Update listing's average rating
	await updateListingRating(review.listingId.toString());

	// Populate user info
	await review.populate('userId', 'name avatarUrl');

	return toPublicReview(review);
}

/**
 * Delete a review (soft delete)
 */
export async function deleteReview(
	reviewId: string,
	userId: string
): Promise<void> {
	await connectDB();

	// Find review
	const review = await Review.findActiveById(reviewId);
	if (!review) {
		throw new Error('Review not found');
	}

	// Verify ownership
	if (review.userId.toString() !== userId) {
		throw new Error('You do not have permission to delete this review');
	}

	const listingId = review.listingId.toString();

	// Soft delete
	review.isDeleted = true;
	review.deletedAt = new Date();
	await review.save();

	// Update listing's average rating
	await updateListingRating(listingId);
}

/**
 * Get all reviews by a user
 */
export async function getUserReviews(userId: string): Promise<PublicReview[]> {
	await connectDB();

	const reviews = await Review.findByUser(userId);
	return reviews.map(toPublicReview);
}

