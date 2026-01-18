// Common types
export type ID = string;

export type Role = 'student' | 'agent' | 'owner' | 'admin';

export interface User {
	id: ID;
	role: Role;
	name: string;
	email?: string;
	phone?: string;
	avatarUrl?: string;
	matricNumber?: string; // for .edu.ng style trust; not validated for real
	verified: boolean;
	createdAt: string;
	savedListingIds: ID[];
	unlockedListingIds: ID[];
}

export type ListingStatus = 'available' | 'taken';
export type PropertyType = 'bedsitter' | 'self-con' | '1-bedroom' | '2-bedroom' | '3-bedroom';
export type AvailabilityStatus = 'available_now' | 'available_soon';

// Predefined amenities
export const AMENITIES_LIST = [
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

export type AmenityType = (typeof AMENITIES_LIST)[number];

export interface Listing {
	id: ID;
	title: string;
	description: string;
	university: string;
	location: string;
	propertyType: PropertyType;
	addressApprox: string; // displayed pre-booking (no house number)
	addressFull: string; // revealed after booking inspection
	priceYearly: number; // NGN per year
	bedrooms: number;
	bathrooms: number;
	walkingMinutes: number; // Distance to campus in walking minutes
	amenities: AmenityType[];
	availabilityStatus: AvailabilityStatus;
	availableFrom?: string; // ISO date when availabilityStatus is 'available_soon'
	photos: string[];
	videos: string[]; // Video URLs (Cloudinary)
	coverPhoto: string; // hero image
	// Landlord/Caretaker contact (private until booking)
	landlordName?: string;
	landlordPhone?: string;
	agentId: ID; // ISA or agent
	status: ListingStatus;
	rating: number; // 1..5
	reviewsCount: number;
	createdAt: string;
	views: number;
	// "Location" assets
	mapPreview: string; // blurred map image path
	mapFull: string; // unblurred map image path (revealed after booking)
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentProof {
	id: ID;
	listingId: ID;
	userId: ID;
	amount: number; // expected ₦1000
	method: 'bank_transfer' | 'ussd' | 'pos';
	reference: string; // free text
	imageUrl: string; // uploaded receipt screenshot (mock)
	status: PaymentStatus;
	submittedAt: string;
	reviewedByAdminId?: ID;
	reviewedAt?: string;
}

export interface AgentProfile {
	userId: ID; // role = 'agent'
	bio?: string;
	totalListings: number;
	totalEarnings: number; // commissions in NGN (mock)
	rating: number;
	verified: boolean;
}

export interface RoommateListing {
	id: ID;
	ownerId: ID; // userId (role 'student' | 'owner')
	ownerType: 'student' | 'owner';
	title: string; // e.g., "Quiet roommate needed near Ugbomro"
	budgetMonthly: number;
	preferences: {
		gender?: 'male' | 'female' | 'any';
		cleanliness?: 'low' | 'medium' | 'high';
		studyHours?: 'morning' | 'evening' | 'night' | 'flexible';
		smoking?: 'no' | 'yes' | 'outdoor_only';
		pets?: 'no' | 'yes';
	};
	moveInDate: string;
	description: string;
	photos: string[]; // /public/images/roommates/*.jpg
	createdAt: string;
}

// Filter types
export interface ListingFilters {
	university?: string;
	locations: string[];
	propertyTypes: PropertyType[];
	priceRange: [number, number];
	bedrooms: number[];
	bathrooms: number[];
	amenities: string[]; // Simplified to string[] for easier filter handling
	availabilityStatus?: AvailabilityStatus;
	sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating';
	verifiedAgentsOnly?: boolean;
}

export interface RoommateFilters {
	budgetRange: [number, number];
	gender?: 'male' | 'female' | 'any';
	cleanliness?: 'low' | 'medium' | 'high';
	moveInDate?: string;
}

// Auth types
export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

// Form types
export interface LoginForm {
	email: string;
	password: string;
}

export interface RegisterForm {
	name: string;
	email: string;
	phone: string;
	role: Role;
	password: string;
	confirmPassword: string;
}

export interface ListingForm {
	title: string;
	description: string;
	university: string;
	location: string;
	propertyType: PropertyType;
	addressApprox: string;
	addressFull: string;
	priceYearly: number;
	bedrooms: number;
	bathrooms: number;
	walkingMinutes: number;
	amenities: AmenityType[];
	availabilityStatus: AvailabilityStatus;
	availableFrom?: string;
	photos: string[];
	videos: string[];
	coverPhoto: string;
	// Landlord/Caretaker contact (required for ISA)
	landlordName?: string;
	landlordPhone?: string;
}

export interface PaymentProofForm {
	amount: number;
	method: 'bank_transfer' | 'ussd' | 'pos';
	reference: string;
	imageUrl: string;
}

export interface RoommateForm {
	title: string;
	budgetMonthly: number;
	preferences: {
		gender?: 'male' | 'female' | 'any';
		cleanliness?: 'low' | 'medium' | 'high';
		studyHours?: 'morning' | 'evening' | 'night' | 'flexible';
		smoking?: 'no' | 'yes' | 'outdoor_only';
		pets?: 'no' | 'yes';
	};
	moveInDate: string;
	description: string;
	photos: string[];
}
