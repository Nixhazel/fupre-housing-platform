import mongoose, { Schema, Document, Model, FilterQuery } from 'mongoose';

/**
 * Listing Status Enum
 */
export const ListingStatus = {
	AVAILABLE: 'available',
	TAKEN: 'taken'
} as const;

export type ListingStatusType = (typeof ListingStatus)[keyof typeof ListingStatus];

/**
 * Campus Area Enum
 */
export const CampusArea = {
	UGBOMRO: 'Ugbomro',
	EFFURUN: 'Effurun',
	ENERHEN: 'Enerhen',
	PTI_ROAD: 'PTI Road',
	OTHER: 'Other'
} as const;

export type CampusAreaType = (typeof CampusArea)[keyof typeof CampusArea];

/**
 * Listing Document Interface
 */
export interface IListing extends Document {
	_id: mongoose.Types.ObjectId;
	title: string;
	description: string;
	campusArea: CampusAreaType;

	// Addresses (addressFull is private - only revealed after unlock)
	addressApprox: string;
	addressFull: string;

	// Pricing
	priceMonthly: number;

	// Property details
	bedrooms: number;
	bathrooms: number;
	distanceToCampusKm: number;
	amenities: string[];

	// Media
	photos: string[];
	coverPhoto: string;
	mapPreview: string;
	mapFull: string; // Private - revealed after unlock

	// Relationships
	agentId: mongoose.Types.ObjectId;

	// Status and metrics
	status: ListingStatusType;
	rating: number;
	reviewsCount: number;
	views: number;

	// Soft delete
	isDeleted: boolean;
	deletedAt?: Date;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;

	// Instance methods
	incrementViews(): Promise<IListing>;
	toPublicObject(): Partial<IListing>;
	toUnlockedObject(): Partial<IListing>;
}

/**
 * Listing Model Static Methods
 */
export interface IListingModel extends Model<IListing> {
	findActive(filter?: FilterQuery<IListing>): Promise<IListing[]>;
	findActiveById(id: string): Promise<IListing | null>;
	findByAgent(agentId: string): Promise<IListing[]>;
}

/**
 * Listing Schema Definition
 */
const ListingSchema = new Schema<IListing, IListingModel>(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			minlength: [5, 'Title must be at least 5 characters'],
			maxlength: [100, 'Title cannot exceed 100 characters']
		},

		description: {
			type: String,
			required: [true, 'Description is required'],
			trim: true,
			minlength: [20, 'Description must be at least 20 characters'],
			maxlength: [1000, 'Description cannot exceed 1000 characters']
		},

		campusArea: {
			type: String,
			required: [true, 'Campus area is required'],
			enum: {
				values: Object.values(CampusArea),
				message: 'Invalid campus area'
			}
		},

		// Public address (no house number)
		addressApprox: {
			type: String,
			required: [true, 'Approximate address is required'],
			trim: true,
			minlength: [5, 'Address must be at least 5 characters'],
			maxlength: [200, 'Address cannot exceed 200 characters']
		},

		// Private address (revealed after unlock)
		addressFull: {
			type: String,
			required: [true, 'Full address is required'],
			trim: true,
			minlength: [10, 'Full address must be at least 10 characters'],
			maxlength: [300, 'Full address cannot exceed 300 characters']
		},

		priceMonthly: {
			type: Number,
			required: [true, 'Monthly price is required'],
			min: [5000, 'Price must be at least ₦5,000'],
			max: [500000, 'Price cannot exceed ₦500,000']
		},

		bedrooms: {
			type: Number,
			required: [true, 'Number of bedrooms is required'],
			min: [1, 'Must have at least 1 bedroom'],
			max: [5, 'Cannot exceed 5 bedrooms']
		},

		bathrooms: {
			type: Number,
			required: [true, 'Number of bathrooms is required'],
			min: [1, 'Must have at least 1 bathroom'],
			max: [4, 'Cannot exceed 4 bathrooms']
		},

		distanceToCampusKm: {
			type: Number,
			required: [true, 'Distance to campus is required'],
			min: [0.1, 'Distance must be at least 0.1km'],
			max: [20, 'Distance cannot exceed 20km']
		},

		amenities: {
			type: [String],
			validate: {
				validator: function (v: string[]) {
					return v.length >= 1 && v.length <= 10;
				},
				message: 'Must have between 1 and 10 amenities'
			}
		},

		photos: {
			type: [String],
			validate: {
				validator: function (v: string[]) {
					return v.length >= 1 && v.length <= 10;
				},
				message: 'Must have between 1 and 10 photos'
			}
		},

		coverPhoto: {
			type: String,
			required: [true, 'Cover photo is required'],
			trim: true
		},

		mapPreview: {
			type: String,
			required: [true, 'Map preview is required'],
			trim: true
		},

		// Private - revealed after unlock
		mapFull: {
			type: String,
			required: [true, 'Full map is required'],
			trim: true
		},

		agentId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Agent ID is required'],
			index: true
		},

		status: {
			type: String,
			enum: {
				values: Object.values(ListingStatus),
				message: 'Invalid status'
			},
			default: ListingStatus.AVAILABLE
		},

		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5
		},

		reviewsCount: {
			type: Number,
			default: 0,
			min: 0
		},

		views: {
			type: Number,
			default: 0,
			min: 0
		},

		// Soft delete
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
		timestamps: true,
		toJSON: {
			transform: function (_doc, ret) {
				delete ret.__v;
				return ret;
			}
		}
	}
);

/**
 * Indexes
 */
// Main search/filter indexes
ListingSchema.index({ campusArea: 1, isDeleted: 1 });
ListingSchema.index({ status: 1, isDeleted: 1 });
ListingSchema.index({ priceMonthly: 1, isDeleted: 1 });
ListingSchema.index({ bedrooms: 1, isDeleted: 1 });
ListingSchema.index({ bathrooms: 1, isDeleted: 1 });

// Composite index for common filter combinations
ListingSchema.index({
	isDeleted: 1,
	status: 1,
	campusArea: 1,
	priceMonthly: 1
});

// Text index for search
ListingSchema.index(
	{
		title: 'text',
		description: 'text',
		addressApprox: 'text'
	},
	{
		weights: {
			title: 10,
			description: 5,
			addressApprox: 3
		}
	}
);

// Sorting indexes
ListingSchema.index({ createdAt: -1, isDeleted: 1 });
ListingSchema.index({ rating: -1, isDeleted: 1 });
ListingSchema.index({ views: -1, isDeleted: 1 });

// Agent's listings
ListingSchema.index({ agentId: 1, isDeleted: 1 });

/**
 * Instance Method: Increment view count
 */
ListingSchema.methods.incrementViews = async function (): Promise<IListing> {
	this.views += 1;
	return this.save();
};

/**
 * Instance Method: Return public object (no private fields)
 */
ListingSchema.methods.toPublicObject = function (): Partial<IListing> {
	const obj = this.toObject() as Record<string, unknown>;
	// Remove private fields
	delete obj.addressFull;
	delete obj.mapFull;
	delete obj.__v;
	return obj as Partial<IListing>;
};

/**
 * Instance Method: Return unlocked object (includes private fields)
 */
ListingSchema.methods.toUnlockedObject = function (): Partial<IListing> {
	const obj = this.toObject() as Record<string, unknown>;
	delete obj.__v;
	return obj as Partial<IListing>;
};

/**
 * Static Method: Find active listings
 */
ListingSchema.statics.findActive = function (
	filter: FilterQuery<IListing> = {}
) {
	return this.find({
		...filter,
		isDeleted: false
	});
};

/**
 * Static Method: Find active listing by ID
 */
ListingSchema.statics.findActiveById = function (id: string) {
	return this.findOne({
		_id: id,
		isDeleted: false
	});
};

/**
 * Static Method: Find listings by agent
 */
ListingSchema.statics.findByAgent = function (agentId: string) {
	return this.find({
		agentId,
		isDeleted: false
	}).sort({ createdAt: -1 });
};

/**
 * Export Model
 */
const Listing: IListingModel =
	(mongoose.models.Listing as IListingModel) ||
	mongoose.model<IListing, IListingModel>('Listing', ListingSchema);

export default Listing;

