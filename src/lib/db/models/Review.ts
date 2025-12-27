import mongoose, { Schema, Document, Model, FilterQuery } from 'mongoose';

/**
 * Review Document Interface
 */
export interface IReview extends Document {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	listingId: mongoose.Types.ObjectId;
	rating: number; // 1-5 stars
	comment: string;
	isDeleted: boolean;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Review Model Static Methods
 */
export interface IReviewModel extends Model<IReview> {
	findActive(filter?: FilterQuery<IReview>): Promise<IReview[]>;
	findActiveById(id: string): Promise<IReview | null>;
	findByListing(listingId: string): Promise<IReview[]>;
	findByUser(userId: string): Promise<IReview[]>;
	findUserReviewForListing(
		userId: string,
		listingId: string
	): Promise<IReview | null>;
	getAverageRating(
		listingId: string
	): Promise<{ average: number; count: number }>;
}

/**
 * Review Schema Definition
 */
const ReviewSchema = new Schema<IReview, IReviewModel>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User ID is required'],
			index: true
		},

		listingId: {
			type: Schema.Types.ObjectId,
			ref: 'Listing',
			required: [true, 'Listing ID is required'],
			index: true
		},

		rating: {
			type: Number,
			required: [true, 'Rating is required'],
			min: [1, 'Rating must be at least 1'],
			max: [5, 'Rating cannot exceed 5']
		},

		comment: {
			type: String,
			required: [true, 'Review comment is required'],
			trim: true,
			minlength: [10, 'Comment must be at least 10 characters'],
			maxlength: [500, 'Comment cannot exceed 500 characters']
		},

		isDeleted: {
			type: Boolean,
			default: false,
			index: true
		},

		deletedAt: {
			type: Date
		}
	},
	{
		timestamps: true
	}
);

// Compound index to ensure one review per user per listing
ReviewSchema.index({ userId: 1, listingId: 1, isDeleted: 1 }, { unique: true });

// Index for efficient listing reviews lookup
ReviewSchema.index({ listingId: 1, isDeleted: 1, createdAt: -1 });

/**
 * Static Methods
 */

// Find all active (non-deleted) reviews
ReviewSchema.statics.findActive = function (
	filter: FilterQuery<IReview> = {}
): Promise<IReview[]> {
	return this.find({ ...filter, isDeleted: false }).exec();
};

// Find active review by ID
ReviewSchema.statics.findActiveById = function (
	id: string
): Promise<IReview | null> {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return Promise.resolve(null);
	}
	return this.findOne({ _id: id, isDeleted: false }).exec();
};

// Find all reviews for a listing
ReviewSchema.statics.findByListing = function (
	listingId: string
): Promise<IReview[]> {
	if (!mongoose.Types.ObjectId.isValid(listingId)) {
		return Promise.resolve([]);
	}
	return this.find({ listingId, isDeleted: false })
		.populate('userId', 'name avatarUrl')
		.sort({ createdAt: -1 })
		.exec();
};

// Find all reviews by a user
ReviewSchema.statics.findByUser = function (
	userId: string
): Promise<IReview[]> {
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return Promise.resolve([]);
	}
	return this.find({ userId, isDeleted: false })
		.populate('listingId', 'title coverPhoto')
		.sort({ createdAt: -1 })
		.exec();
};

// Find a user's review for a specific listing
ReviewSchema.statics.findUserReviewForListing = function (
	userId: string,
	listingId: string
): Promise<IReview | null> {
	if (
		!mongoose.Types.ObjectId.isValid(userId) ||
		!mongoose.Types.ObjectId.isValid(listingId)
	) {
		return Promise.resolve(null);
	}
	return this.findOne({ userId, listingId, isDeleted: false }).exec();
};

// Calculate average rating for a listing
ReviewSchema.statics.getAverageRating = async function (
	listingId: string
): Promise<{ average: number; count: number }> {
	if (!mongoose.Types.ObjectId.isValid(listingId)) {
		return { average: 0, count: 0 };
	}

	const result = await this.aggregate([
		{
			$match: {
				listingId: new mongoose.Types.ObjectId(listingId),
				isDeleted: false
			}
		},
		{
			$group: {
				_id: '$listingId',
				average: { $avg: '$rating' },
				count: { $sum: 1 }
			}
		}
	]);

	if (result.length === 0) {
		return { average: 0, count: 0 };
	}

	return {
		average: Math.round(result[0].average * 10) / 10, // Round to 1 decimal
		count: result[0].count
	};
};

/**
 * Review Model
 */
const Review =
	(mongoose.models.Review as IReviewModel) ||
	mongoose.model<IReview, IReviewModel>('Review', ReviewSchema);

export default Review;
