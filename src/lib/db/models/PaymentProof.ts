import mongoose, { Schema, Document, Model } from 'mongoose';
import { PLATFORM_CONFIG } from '@/lib/config/env';

/**
 * Payment Status Enum
 */
export const PaymentStatus = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected'
} as const;

export type PaymentStatusType =
	(typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Payment Method Enum
 */
export const PaymentMethod = {
	BANK_TRANSFER: 'bank_transfer',
	USSD: 'ussd',
	POS: 'pos'
} as const;

export type PaymentMethodType =
	(typeof PaymentMethod)[keyof typeof PaymentMethod];

/**
 * PaymentProof Document Interface
 */
export interface IPaymentProof extends Document {
	_id: mongoose.Types.ObjectId;

	// Relationships
	listingId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;

	// Payment details
	amount: number;
	method: PaymentMethodType;
	reference: string;
	imageUrl: string;

	// Status
	status: PaymentStatusType;
	rejectionReason?: string;

	// Review details
	reviewedByAdminId?: mongoose.Types.ObjectId;
	reviewedAt?: Date;

	// Timestamps
	submittedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * PaymentProof Model Static Methods
 */
export interface IPaymentProofModel extends Model<IPaymentProof> {
	findPending(): Promise<IPaymentProof[]>;
	findByUser(userId: string): Promise<IPaymentProof[]>;
	findByListing(listingId: string): Promise<IPaymentProof[]>;
	hasPendingProof(userId: string, listingId: string): Promise<boolean>;
	hasApprovedProof(userId: string, listingId: string): Promise<boolean>;
	countApprovedByListingAgent(agentId: string): Promise<number>;
}

/**
 * PaymentProof Schema Definition
 */
const PaymentProofSchema = new Schema<IPaymentProof, IPaymentProofModel>(
	{
		listingId: {
			type: Schema.Types.ObjectId,
			ref: 'Listing',
			required: [true, 'Listing ID is required'],
			index: true
		},

		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User ID is required'],
			index: true
		},

		amount: {
			type: Number,
			required: [true, 'Amount is required'],
			min: [
				PLATFORM_CONFIG.UNLOCK_FEE,
				`Amount must be exactly ₦${PLATFORM_CONFIG.UNLOCK_FEE.toLocaleString()}`
			],
			max: [
				PLATFORM_CONFIG.UNLOCK_FEE,
				`Amount must be exactly ₦${PLATFORM_CONFIG.UNLOCK_FEE.toLocaleString()}`
			],
			default: PLATFORM_CONFIG.UNLOCK_FEE
		},

		method: {
			type: String,
			required: [true, 'Payment method is required'],
			enum: {
				values: Object.values(PaymentMethod),
				message: 'Invalid payment method'
			}
		},

		reference: {
			type: String,
			required: [true, 'Transaction reference is required'],
			trim: true,
			minlength: [5, 'Reference must be at least 5 characters'],
			maxlength: [50, 'Reference cannot exceed 50 characters']
		},

		imageUrl: {
			type: String,
			required: [true, 'Receipt image is required'],
			trim: true
		},

		status: {
			type: String,
			enum: {
				values: Object.values(PaymentStatus),
				message: 'Invalid status'
			},
			default: PaymentStatus.PENDING,
			index: true
		},

		rejectionReason: {
			type: String,
			trim: true,
			maxlength: [500, 'Rejection reason cannot exceed 500 characters']
			// Required when status is 'rejected' - enforced at service level
		},

		reviewedByAdminId: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},

		reviewedAt: {
			type: Date
		},

		submittedAt: {
			type: Date,
			default: Date.now
		}
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform: function (_doc, ret: Record<string, unknown>) {
				ret.id = ret._id?.toString();
				delete ret._id;
				delete ret.__v;
				return ret;
			}
		}
	}
);

/**
 * Indexes
 */
// Main status queries
PaymentProofSchema.index({ status: 1, createdAt: -1 });

// User's proofs
PaymentProofSchema.index({ userId: 1, status: 1 });
PaymentProofSchema.index({ userId: 1, createdAt: -1 });

// Listing's proofs
PaymentProofSchema.index({ listingId: 1, status: 1 });

// Composite index for checking existing pending proof
PaymentProofSchema.index({ userId: 1, listingId: 1, status: 1 });

// Admin review queries
PaymentProofSchema.index({ reviewedByAdminId: 1, reviewedAt: -1 });

/**
 * Pre-save Hook: Set submittedAt on creation
 */
PaymentProofSchema.pre('save', function () {
	if (this.isNew && !this.submittedAt) {
		this.submittedAt = new Date();
	}
});

/**
 * Static Method: Find all pending proofs
 */
PaymentProofSchema.statics.findPending = function () {
	return this.find({ status: PaymentStatus.PENDING })
		.populate('userId', 'name email phone')
		.populate('listingId', 'title coverPhoto priceMonthly')
		.sort({ createdAt: -1 });
};

/**
 * Static Method: Find proofs by user
 */
PaymentProofSchema.statics.findByUser = function (userId: string) {
	return this.find({ userId })
		.populate('listingId', 'title coverPhoto priceMonthly campusArea')
		.sort({ createdAt: -1 });
};

/**
 * Static Method: Find proofs by listing
 */
PaymentProofSchema.statics.findByListing = function (listingId: string) {
	return this.find({ listingId })
		.populate('userId', 'name email')
		.sort({ createdAt: -1 });
};

/**
 * Static Method: Check if user has pending proof for listing
 */
PaymentProofSchema.statics.hasPendingProof = async function (
	userId: string,
	listingId: string
): Promise<boolean> {
	const count = await this.countDocuments({
		userId,
		listingId,
		status: PaymentStatus.PENDING
	});
	return count > 0;
};

/**
 * Static Method: Check if user has approved proof for listing
 */
PaymentProofSchema.statics.hasApprovedProof = async function (
	userId: string,
	listingId: string
): Promise<boolean> {
	const count = await this.countDocuments({
		userId,
		listingId,
		status: PaymentStatus.APPROVED
	});
	return count > 0;
};

/**
 * Static Method: Count approved proofs for listings by an agent
 * Used for earnings calculation
 */
PaymentProofSchema.statics.countApprovedByListingAgent = async function (
	agentId: string
): Promise<number> {
	const result = await this.aggregate([
		{
			$match: { status: PaymentStatus.APPROVED }
		},
		{
			$lookup: {
				from: 'listings',
				localField: 'listingId',
				foreignField: '_id',
				as: 'listing'
			}
		},
		{
			$unwind: '$listing'
		},
		{
			$match: {
				'listing.agentId': new mongoose.Types.ObjectId(agentId),
				'listing.isDeleted': false
			}
		},
		{
			$count: 'total'
		}
	]);

	return result[0]?.total || 0;
};

/**
 * Export Model
 */
const PaymentProof: IPaymentProofModel =
	(mongoose.models.PaymentProof as IPaymentProofModel) ||
	mongoose.model<IPaymentProof, IPaymentProofModel>(
		'PaymentProof',
		PaymentProofSchema
	);

export default PaymentProof;
