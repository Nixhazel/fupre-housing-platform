/**
 * API Type Definitions
 *
 * Shared types for API requests and responses
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	errors?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
	items: T[];
	pagination: PaginationMeta;
}

/**
 * API Error class for typed error handling
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public code?: string,
		public errors?: Record<string, string[]>
	) {
		super(message);
		this.name = 'ApiError';

		// Maintain proper stack trace in V8 environments
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ApiError);
		}
	}

	/**
	 * Check if this is an authentication error
	 */
	get isAuthError(): boolean {
		return this.status === 401;
	}

	/**
	 * Check if this is a forbidden error
	 */
	get isForbiddenError(): boolean {
		return this.status === 403;
	}

	/**
	 * Check if this is a validation error
	 */
	get isValidationError(): boolean {
		return this.status === 400 && !!this.errors;
	}

	/**
	 * Check if this is a not found error
	 */
	get isNotFoundError(): boolean {
		return this.status === 404;
	}

	/**
	 * Check if this is a conflict error
	 */
	get isConflictError(): boolean {
		return this.status === 409;
	}

	/**
	 * Check if this is a server error
	 */
	get isServerError(): boolean {
		return this.status >= 500;
	}
}

/**
 * Session user type (from backend /api/auth/me)
 */
export interface SessionUser {
	id: string;
	email: string;
	name: string;
	role: 'student' | 'agent' | 'owner' | 'admin';
	phone?: string;
	avatarUrl?: string;
	matricNumber?: string;
	isEmailVerified: boolean;
	isVerified: boolean;
	savedListingIds: string[];
	savedRoommateIds: string[];
	unlockedListingIds: string[];
	createdAt: string;
}

/**
 * Login response
 */
export interface LoginResponse {
	user: SessionUser;
}

/**
 * Register response
 */
export interface RegisterResponse {
	user: SessionUser;
	message: string;
}

/**
 * Listing agent info (public view)
 */
export interface ListingAgent {
	id: string;
	name: string;
	avatarUrl?: string;
	isVerified: boolean;
	listingsCount?: number;
	// Contact info only available when listing is unlocked
	phone?: string;
	email?: string;
}

/**
 * Listing type (public view)
 */
export interface Listing {
	id: string;
	title: string;
	description: string;
	campusArea: 'Ugbomro' | 'Effurun' | 'Enerhen' | 'PTI Road' | 'Other';
	addressApprox: string;
	addressFull?: string; // Only present if unlocked
	priceMonthly: number;
	bedrooms: number;
	bathrooms: number;
	distanceToCampusKm: number;
	amenities: string[];
	photos: string[];
	coverPhoto: string;
	agentId: string;
	agent?: ListingAgent; // Populated agent info
	status: 'available' | 'taken';
	rating: number;
	reviewsCount: number;
	views: number;
	mapPreview: string;
	mapFull?: string; // Only present if unlocked
	createdAt: string;
	updatedAt: string;
}

/**
 * Roommate listing owner info (populated)
 */
export interface RoommateOwner {
	id: string;
	name: string;
	email: string;
	phone?: string;
	avatarUrl?: string;
	role: string;
	isVerified: boolean;
	createdAt: string;
}

/**
 * Roommate listing type
 */
export interface RoommateListing {
	id: string;
	ownerId: string;
	ownerType: 'student' | 'owner';
	title: string;
	budgetMonthly: number;
	moveInDate: string;
	description: string;
	photos: string[];
	preferences: {
		gender?: 'male' | 'female' | 'any';
		cleanliness?: 'low' | 'medium' | 'high';
		studyHours?: 'morning' | 'evening' | 'night' | 'flexible';
		smoking?: 'no' | 'yes' | 'outdoor_only';
		pets?: 'no' | 'yes';
	};
	owner?: RoommateOwner | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Payment proof type
 */
export interface PaymentProof {
	id: string;
	listingId: string;
	userId: string;
	amount: number;
	method: 'bank_transfer' | 'ussd' | 'pos';
	reference: string;
	imageUrl: string;
	status: 'pending' | 'approved' | 'rejected';
	rejectionReason?: string;
	reviewedByAdminId?: string;
	reviewedAt?: string;
	submittedAt: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Agent stats type
 */
export interface AgentStats {
	totalListings: number;
	activeListings: number;
	totalViews: number;
	totalUnlocks: number;
	totalEarnings: number;
}

/**
 * Monthly earning type
 */
export interface MonthlyEarning {
	month: string;
	unlocks: number;
	amount: number;
}

/**
 * Platform stats type (admin)
 */
export interface PlatformStats {
	totalUsers: number;
	usersByRole: {
		student: number;
		agent: number;
		owner: number;
		admin: number;
	};
	totalListings: number;
	activeListings: number;
	totalRoommates: number;
	pendingProofs: number;
	approvedProofs: number;
	rejectedProofs: number;
	totalRevenue: number;
}

