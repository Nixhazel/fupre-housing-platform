/**
 * Database Models Index
 *
 * Re-exports all Mongoose models and their associated types/enums
 */

// User Model
export { default as User } from './User';
export type { IUser, IUserModel } from './User';
export { UserRole } from './User';
export type { UserRoleType } from './User';

// Listing Model
export { default as Listing } from './Listing';
export type { IListing, IListingModel } from './Listing';
export { ListingStatus, CampusArea } from './Listing';
export type { ListingStatusType, CampusAreaType } from './Listing';

// PaymentProof Model
export { default as PaymentProof } from './PaymentProof';
export type { IPaymentProof, IPaymentProofModel } from './PaymentProof';
export { PaymentStatus, PaymentMethod } from './PaymentProof';
export type { PaymentStatusType, PaymentMethodType } from './PaymentProof';

// RoommateListing Model
export { default as RoommateListing } from './RoommateListing';
export type {
	IRoommateListing,
	IRoommateListingModel,
	IRoommatePreferences
} from './RoommateListing';
export {
	OwnerType,
	GenderPreference,
	CleanlinessPreference,
	StudyHoursPreference,
	SmokingPreference,
	PetsPreference
} from './RoommateListing';
export type {
	OwnerTypeType,
	GenderPreferenceType,
	CleanlinessPreferenceType,
	StudyHoursPreferenceType,
	SmokingPreferenceType,
	PetsPreferenceType
} from './RoommateListing';

