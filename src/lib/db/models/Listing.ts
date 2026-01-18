import mongoose, { Schema, Document, Model, FilterQuery } from 'mongoose';
import { UNIVERSITY_IDS, isValidLocationForUniversity } from '@/lib/config/universities';

/**
 * Property Type Enum
 */
export const PropertyType = {
	BEDSITTER: 'bedsitter',
	SELF_CON: 'self-con',
	ONE_BEDROOM: '1-bedroom',
	TWO_BEDROOM: '2-bedroom',
	THREE_BEDROOM: '3-bedroom'
} as const;

export type PropertyTypeType = (typeof PropertyType)[keyof typeof PropertyType];

/**
 * Listing Status Enum
 */
export const ListingStatus = {
	AVAILABLE: 'available',
	TAKEN: 'taken'
} as const;

export type ListingStatusType =
	(typeof ListingStatus)[keyof typeof ListingStatus];

/**
 * Availability Status Enum
 */
export const AvailabilityStatus = {
	AVAILABLE_NOW: 'available_now',
	AVAILABLE_SOON: 'available_soon'
} as const;

export type AvailabilityStatusType =
	(typeof AvailabilityStatus)[keyof typeof AvailabilityStatus];

/**
 * Predefined Amenities List
 */
export const AMENITIES = [
	'Water',
	'Light (Electricity)',
	'Tiles',
	'POP Ceiling',
	'PVC Ceiling',
	'Fenced Compound',
	'Gated Compound',
	'Wardrobe',
	'Landlord in Compound',
	'Landlord Not in Compound',
	'Private Balcony',
	'Upstairs',
	'Downstairs'
] as const;

export type AmenityType = (typeof AMENITIES)[number];

/**
 * Listing Document Interface
 */
export interface IListing extends Document {
	_id: mongoose.Types.ObjectId;
	title: string;
	description: string;
	university: string;
	location: string;
	propertyType: PropertyTypeType;

	// Addresses (addressFull is private - only revealed after unlock/booking)
	addressApprox: string;
	addressFull: string;

	// Pricing (yearly rent)
	priceYearly: number;

	// Property details
	bedrooms: number;
	bathrooms: number;
	walkingMinutes: number; // Distance to campus in walking minutes
	amenities: AmenityType[];

	// Availability
	availabilityStatus: AvailabilityStatusType;
	availableFrom?: Date; // Required when availabilityStatus is 'available_soon'

	// Media
	photos: string[];
	videos: string[]; // Video URLs (Cloudinary)
	coverPhoto: string;
	mapPreview: string;
	mapFull: string; // Private - revealed after booking

	// Landlord/Caretaker Contact (required for ISA listings, private until booking)
	landlordName?: string;
	landlordPhone?: string;

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

		university: {
			type: String,
			required: [true, 'University is required'],
			enum: {
				values: UNIVERSITY_IDS,
				message: 'Invalid university'
			},
			index: true
		},

		location: {
			type: String,
			required: [true, 'Location is required'],
			trim: true,
			minlength: [2, 'Location must be at least 2 characters'],
			maxlength: [50, 'Location cannot exceed 50 characters'],
			validate: {
				validator: function (this: IListing, value: string) {
					return isValidLocationForUniversity(this.university, value);
				},
				message: 'Invalid location for the selected university'
			}
		},

		propertyType: {
			type: String,
			required: [true, 'Property type is required'],
			enum: {
				values: Object.values(PropertyType),
				message: 'Invalid property type'
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

		// Private address (revealed after booking inspection)
		addressFull: {
			type: String,
			required: [true, 'Full address is required'],
			trim: true,
			minlength: [10, 'Full address must be at least 10 characters'],
			maxlength: [300, 'Full address cannot exceed 300 characters']
		},

		priceYearly: {
			type: Number,
			required: [true, 'Yearly rent is required'],
			min: [50000, 'Price must be at least ₦50,000/year'],
			max: [5000000, 'Price cannot exceed ₦5,000,000/year']
		},

		bedrooms: {
			type: Number,
			required: [true, 'Number of bedrooms is required'],
			min: [0, 'Bedrooms cannot be negative'], // 0 for bedsitter/self-con
			max: [5, 'Cannot exceed 5 bedrooms']
		},

		bathrooms: {
			type: Number,
			required: [true, 'Number of bathrooms is required'],
			min: [1, 'Must have at least 1 bathroom'],
			max: [4, 'Cannot exceed 4 bathrooms']
		},

		walkingMinutes: {
			type: Number,
			required: [true, 'Walking time to campus is required'],
			min: [1, 'Walking time must be at least 1 minute'],
			max: [120, 'Walking time cannot exceed 120 minutes (2 hours)']
		},

		amenities: {
			type: [String],
			enum: {
				values: AMENITIES,
				message: 'Invalid amenity: {VALUE}'
			},
			validate: {
				validator: function (v: string[]) {
					return v.length >= 1 && v.length <= 13;
				},
				message: 'Must have between 1 and 13 amenities'
			}
		},

		// Availability
		availabilityStatus: {
			type: String,
			enum: {
				values: Object.values(AvailabilityStatus),
				message: 'Invalid availability status'
			},
			default: AvailabilityStatus.AVAILABLE_NOW
		},

		availableFrom: {
			type: Date,
			// Required when availabilityStatus is 'available_soon'
			validate: {
				validator: function (this: IListing, value: Date | undefined) {
					if (this.availabilityStatus === AvailabilityStatus.AVAILABLE_SOON) {
						return value != null && value > new Date();
					}
					return true;
				},
				message: 'Available from date is required and must be in the future when status is "available soon"'
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

		videos: {
			type: [String],
			default: [],
			validate: {
				validator: function (v: string[]) {
					return v.length <= 3;
				},
				message: 'Cannot have more than 3 videos'
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

		// Private - revealed after booking inspection
		mapFull: {
			type: String,
			required: [true, 'Full map is required'],
			trim: true
		},

		// Landlord/Caretaker contact (required for ISA, private until booking)
		landlordName: {
			type: String,
			trim: true,
			maxlength: [100, 'Landlord name cannot exceed 100 characters']
		},

		landlordPhone: {
			type: String,
			trim: true,
			match: [/^\+234\d{10}$/, 'Please provide a valid Nigerian phone number']
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
// Main search/filter indexes
ListingSchema.index({ university: 1, isDeleted: 1 });
ListingSchema.index({ university: 1, location: 1, isDeleted: 1 });
ListingSchema.index({ status: 1, isDeleted: 1 });
ListingSchema.index({ priceYearly: 1, isDeleted: 1 });
ListingSchema.index({ bedrooms: 1, isDeleted: 1 });
ListingSchema.index({ bathrooms: 1, isDeleted: 1 });

// Composite index for common filter combinations
ListingSchema.index({
	isDeleted: 1,
	status: 1,
	university: 1,
	location: 1,
	priceYearly: 1
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
