import mongoose, { Schema, Document, Model, FilterQuery } from 'mongoose';

/**
 * Owner Type Enum
 */
export const OwnerType = {
	STUDENT: 'student',
	OWNER: 'owner'
} as const;

export type OwnerTypeType = (typeof OwnerType)[keyof typeof OwnerType];

/**
 * Gender Preference Enum
 */
export const GenderPreference = {
	MALE: 'male',
	FEMALE: 'female',
	ANY: 'any'
} as const;

export type GenderPreferenceType =
	(typeof GenderPreference)[keyof typeof GenderPreference];

/**
 * Cleanliness Preference Enum
 */
export const CleanlinessPreference = {
	LOW: 'low',
	MEDIUM: 'medium',
	HIGH: 'high'
} as const;

export type CleanlinessPreferenceType =
	(typeof CleanlinessPreference)[keyof typeof CleanlinessPreference];

/**
 * Study Hours Preference Enum
 */
export const StudyHoursPreference = {
	MORNING: 'morning',
	EVENING: 'evening',
	NIGHT: 'night',
	FLEXIBLE: 'flexible'
} as const;

export type StudyHoursPreferenceType =
	(typeof StudyHoursPreference)[keyof typeof StudyHoursPreference];

/**
 * Smoking Preference Enum
 */
export const SmokingPreference = {
	NO: 'no',
	YES: 'yes',
	OUTDOOR_ONLY: 'outdoor_only'
} as const;

export type SmokingPreferenceType =
	(typeof SmokingPreference)[keyof typeof SmokingPreference];

/**
 * Pets Preference Enum
 */
export const PetsPreference = {
	NO: 'no',
	YES: 'yes'
} as const;

export type PetsPreferenceType =
	(typeof PetsPreference)[keyof typeof PetsPreference];

/**
 * Preferences Interface
 */
export interface IRoommatePreferences {
	gender?: GenderPreferenceType;
	cleanliness?: CleanlinessPreferenceType;
	studyHours?: StudyHoursPreferenceType;
	smoking?: SmokingPreferenceType;
	pets?: PetsPreferenceType;
}

/**
 * RoommateListing Document Interface
 */
export interface IRoommateListing extends Document {
	_id: mongoose.Types.ObjectId;

	// Owner relationship
	ownerId: mongoose.Types.ObjectId;
	ownerType: OwnerTypeType;

	// Listing details
	title: string;
	budgetMonthly: number;
	moveInDate: Date;
	description: string;
	photos: string[];

	// Preferences
	preferences: IRoommatePreferences;

	// Soft delete
	isDeleted: boolean;
	deletedAt?: Date;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
}

/**
 * RoommateListing Model Static Methods
 */
export interface IRoommateListingModel extends Model<IRoommateListing> {
	findActive(
		filter?: FilterQuery<IRoommateListing>
	): Promise<IRoommateListing[]>;
	findActiveById(id: string): Promise<IRoommateListing | null>;
	findByOwner(ownerId: string): Promise<IRoommateListing[]>;
}

/**
 * Preferences Sub-Schema
 */
const PreferencesSchema = new Schema<IRoommatePreferences>(
	{
		gender: {
			type: String,
			enum: {
				values: Object.values(GenderPreference),
				message: 'Invalid gender preference'
			}
		},

		cleanliness: {
			type: String,
			enum: {
				values: Object.values(CleanlinessPreference),
				message: 'Invalid cleanliness preference'
			}
		},

		studyHours: {
			type: String,
			enum: {
				values: Object.values(StudyHoursPreference),
				message: 'Invalid study hours preference'
			}
		},

		smoking: {
			type: String,
			enum: {
				values: Object.values(SmokingPreference),
				message: 'Invalid smoking preference'
			}
		},

		pets: {
			type: String,
			enum: {
				values: Object.values(PetsPreference),
				message: 'Invalid pets preference'
			}
		}
	},
	{
		_id: false // Don't create _id for subdocument
	}
);

/**
 * RoommateListing Schema Definition
 */
const RoommateListingSchema = new Schema<
	IRoommateListing,
	IRoommateListingModel
>(
	{
		ownerId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Owner ID is required'],
			index: true
		},

		ownerType: {
			type: String,
			required: [true, 'Owner type is required'],
			enum: {
				values: Object.values(OwnerType),
				message: 'Invalid owner type'
			}
		},

		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			minlength: [5, 'Title must be at least 5 characters'],
			maxlength: [100, 'Title cannot exceed 100 characters']
		},

		budgetMonthly: {
			type: Number,
			required: [true, 'Monthly budget is required'],
			min: [10000, 'Budget must be at least ₦10,000'],
			max: [100000, 'Budget cannot exceed ₦100,000']
		},

		moveInDate: {
			type: Date,
			required: [true, 'Move-in date is required']
			// Validation for future date done at service level
		},

		description: {
			type: String,
			required: [true, 'Description is required'],
			trim: true,
			minlength: [20, 'Description must be at least 20 characters'],
			maxlength: [500, 'Description cannot exceed 500 characters']
		},

		photos: {
			type: [String],
			validate: {
				validator: function (v: string[]) {
					return v.length >= 1 && v.length <= 5;
				},
				message: 'Must have between 1 and 5 photos'
			}
		},

		preferences: {
			type: PreferencesSchema,
			default: {}
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
RoommateListingSchema.index({ budgetMonthly: 1, isDeleted: 1 });
RoommateListingSchema.index({ 'preferences.gender': 1, isDeleted: 1 });
RoommateListingSchema.index({ 'preferences.cleanliness': 1, isDeleted: 1 });
RoommateListingSchema.index({ moveInDate: 1, isDeleted: 1 });

// Composite index for common filter combinations
RoommateListingSchema.index({
	isDeleted: 1,
	budgetMonthly: 1,
	'preferences.gender': 1
});

// Text index for search
RoommateListingSchema.index(
	{
		title: 'text',
		description: 'text'
	},
	{
		weights: {
			title: 10,
			description: 5
		}
	}
);

// Sorting index
RoommateListingSchema.index({ createdAt: -1, isDeleted: 1 });

// Owner's listings
RoommateListingSchema.index({ ownerId: 1, isDeleted: 1 });

/**
 * Static Method: Find active roommate listings
 */
RoommateListingSchema.statics.findActive = function (
	filter: FilterQuery<IRoommateListing> = {}
) {
	return this.find({
		...filter,
		isDeleted: false
	}).populate('ownerId', 'name avatarUrl phone');
};

/**
 * Static Method: Find active roommate listing by ID
 */
RoommateListingSchema.statics.findActiveById = function (id: string) {
	return this.findOne({
		_id: id,
		isDeleted: false
	}).populate('ownerId', 'name avatarUrl phone email');
};

/**
 * Static Method: Find roommate listings by owner
 */
RoommateListingSchema.statics.findByOwner = function (ownerId: string) {
	return this.find({
		ownerId,
		isDeleted: false
	}).sort({ createdAt: -1 });
};

/**
 * Export Model
 */
const RoommateListing: IRoommateListingModel =
	(mongoose.models.RoommateListing as IRoommateListingModel) ||
	mongoose.model<IRoommateListing, IRoommateListingModel>(
		'RoommateListing',
		RoommateListingSchema
	);

export default RoommateListing;
