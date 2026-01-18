import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Role Enum
 */
export const UserRole = {
	STUDENT: 'student',
	AGENT: 'agent',
	OWNER: 'owner',
	ADMIN: 'admin'
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * User Document Interface
 */
export interface IUser extends Document {
	_id: mongoose.Types.ObjectId;
	email: string;
	password: string;
	name: string; // Real name (hidden for agents until booking)
	codename?: string; // Agent codename (displayed publicly instead of real name)
	phone?: string;
	role: UserRoleType;
	avatarUrl?: string;
	matricNumber?: string;

	// Verification flags
	isEmailVerified: boolean;
	isVerified: boolean; // Admin verification for agents

	// Token fields for email verification
	emailVerificationToken?: string;
	emailVerificationExpires?: Date;

	// Token fields for password reset
	passwordResetToken?: string;
	passwordResetExpires?: Date;

	// Listing relationships
	savedListingIds: mongoose.Types.ObjectId[];
	savedRoommateIds: mongoose.Types.ObjectId[];
	unlockedListingIds: mongoose.Types.ObjectId[];

	// Soft delete
	isDeleted: boolean;
	deletedAt?: Date;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;

	// Instance methods
	comparePassword(candidatePassword: string): Promise<boolean>;
	toSafeObject(): Partial<IUser>;
}

/**
 * User Model Static Methods
 */
export interface IUserModel extends Model<IUser> {
	findByEmail(email: string): Promise<IUser | null>;
	findActiveById(id: string): Promise<IUser | null>;
}

/**
 * User Schema Definition
 */
const UserSchema = new Schema<IUser, IUserModel>(
	{
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				'Please provide a valid email address'
			]
		},

		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, 'Password must be at least 6 characters'],
			select: false // Don't include password in queries by default
		},

		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters'],
			maxlength: [50, 'Name cannot exceed 50 characters']
		},

		codename: {
			type: String,
			trim: true,
			minlength: [2, 'Codename must be at least 2 characters'],
			maxlength: [30, 'Codename cannot exceed 30 characters']
			// Required for agents, validated at application level
		},

		phone: {
			type: String,
			trim: true,
			match: [/^\+234\d{10}$/, 'Please provide a valid Nigerian phone number']
		},

		role: {
			type: String,
			enum: {
				values: Object.values(UserRole),
				message: 'Invalid role. Must be student, agent, owner, or admin'
			},
			default: UserRole.STUDENT
		},

		avatarUrl: {
			type: String,
			trim: true
		},

		matricNumber: {
			type: String,
			trim: true
			// Not validated - optional field
		},

		// Verification flags
		isEmailVerified: {
			type: Boolean,
			default: false
		},

		isVerified: {
			type: Boolean,
			default: false
		},

		// Email verification tokens
		emailVerificationToken: {
			type: String,
			select: false
		},

		emailVerificationExpires: {
			type: Date,
			select: false
		},

		// Password reset tokens
		passwordResetToken: {
			type: String,
			select: false
		},

		passwordResetExpires: {
			type: Date,
			select: false
		},

		// Listing relationships
		savedListingIds: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Listing'
			}
		],

		savedRoommateIds: [
			{
				type: Schema.Types.ObjectId,
				ref: 'RoommateListing'
			}
		],

		unlockedListingIds: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Listing'
			}
		],

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
				// Convert _id to id
				ret.id = ret._id?.toString();
				delete ret._id;
				// Remove sensitive fields from JSON output
				delete ret.password;
				delete ret.emailVerificationToken;
				delete ret.emailVerificationExpires;
				delete ret.passwordResetToken;
				delete ret.passwordResetExpires;
				delete ret.__v;
				return ret;
			}
		}
	}
);

/**
 * Indexes
 */
// Note: Email index already created via 'unique: true' in field definition

// Composite index for finding active users by role
UserSchema.index({ role: 1, isDeleted: 1 });

// Index for finding unverified users
UserSchema.index({ isEmailVerified: 1, isDeleted: 1 });

// Index for agents verification status
UserSchema.index({ role: 1, isVerified: 1, isDeleted: 1 });

/**
 * Pre-save Hook: Hash password before saving
 */
UserSchema.pre('save', async function (next) {
	// Only hash password if it's modified
	if (!this.isModified('password')) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error as Error);
	}
});

/**
 * Instance Method: Compare password
 */
UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance Method: Return safe user object (no sensitive data)
 */
UserSchema.methods.toSafeObject = function (): Partial<IUser> {
	const obj = this.toObject() as Record<string, unknown>;
	delete obj.password;
	delete obj.emailVerificationToken;
	delete obj.emailVerificationExpires;
	delete obj.passwordResetToken;
	delete obj.passwordResetExpires;
	delete obj.__v;
	return obj as Partial<IUser>;
};

/**
 * Static Method: Find user by email
 */
UserSchema.statics.findByEmail = function (email: string) {
	return this.findOne({
		email: email.toLowerCase(),
		isDeleted: false
	}).select('+password');
};

/**
 * Static Method: Find active user by ID
 */
UserSchema.statics.findActiveById = function (id: string) {
	return this.findOne({
		_id: id,
		isDeleted: false
	});
};

/**
 * Export Model
 * Check if model exists to prevent recompilation in dev mode
 */
const User: IUserModel =
	(mongoose.models.User as IUserModel) ||
	mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;

