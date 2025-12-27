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

export interface Listing {
	id: ID;
	title: string;
	description: string;
	campusArea: 'Ugbomro' | 'Effurun' | 'Enerhen' | 'PTI Road' | 'Other';
	addressApprox: string; // displayed pre-unlock (no house number)
	addressFull: string; // revealed after unlock
	priceMonthly: number; // NGN
	bedrooms: number;
	bathrooms: number;
	distanceToCampusKm: number;
	amenities: string[]; // e.g. ['Wi-Fi','Water','Power','Furnished']
	photos: string[]; // /public/images/listings/*.jpg
	coverPhoto: string; // hero image
	agentId: ID; // ISA
	status: ListingStatus;
	rating: number; // 1..5
	reviewsCount: number;
	createdAt: string;
	views: number;
	// "Location" assets
	mapPreview: string; // blurred map image path
	mapFull: string; // unblurred map image path (revealed after unlock)
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
	priceRange: [number, number];
	bedrooms: number[];
	bathrooms: number[];
	campusAreas: string[];
	amenities: string[];
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
	campusArea: string;
	addressApprox: string;
	addressFull: string;
	priceMonthly: number;
	bedrooms: number;
	bathrooms: number;
	distanceToCampusKm: number;
	amenities: string[];
	photos: string[];
	coverPhoto: string;
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
