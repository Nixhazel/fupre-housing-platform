import mongoose from 'mongoose';
import connectDB from '@/lib/db/connect';
import Listing, { type IListing } from '@/lib/db/models/Listing';
import User from '@/lib/db/models/User';
import type {
	CreateListingInput,
	UpdateListingInput,
	ListingQueryInput
} from '@/lib/validators/listings.server';

/**
 * Listings Service
 *
 * Business logic for listing operations
 */

/**
 * Agent info included in listing response
 */
export interface ListingAgent {
	id: string;
	name: string;
	avatarUrl?: string;
	isVerified: boolean;
	listingsCount?: number;
}

/**
 * Agent info with contact details (for unlocked listings)
 */
export interface ListingAgentUnlocked extends ListingAgent {
	phone: string;
	email: string;
}

/**
 * Listing response (public, no private fields)
 */
export interface PublicListing {
	id: string;
	title: string;
	description: string;
	campusArea: string;
	addressApprox: string;
	priceMonthly: number;
	bedrooms: number;
	bathrooms: number;
	distanceToCampusKm: number;
	amenities: string[];
	photos: string[];
	coverPhoto: string;
	mapPreview: string;
	agentId: string;
	agent?: ListingAgent;
	status: string;
	rating: number;
	reviewsCount: number;
	views: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Unlocked listing response (includes private fields)
 */
export interface UnlockedListing extends Omit<PublicListing, 'agent'> {
	addressFull: string;
	mapFull: string;
	agent?: ListingAgentUnlocked;
}

/**
 * Paginated listings response
 */
export interface PaginatedListings {
	listings: PublicListing[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

/**
 * Convert Mongoose document to public listing object
 */
function toPublicListing(listing: IListing): PublicListing {
	return {
		id: listing._id.toString(),
		title: listing.title,
		description: listing.description,
		campusArea: listing.campusArea,
		addressApprox: listing.addressApprox,
		priceMonthly: listing.priceMonthly,
		bedrooms: listing.bedrooms,
		bathrooms: listing.bathrooms,
		distanceToCampusKm: listing.distanceToCampusKm,
		amenities: listing.amenities,
		photos: listing.photos,
		coverPhoto: listing.coverPhoto,
		mapPreview: listing.mapPreview,
		agentId: listing.agentId.toString(),
		status: listing.status,
		rating: listing.rating,
		reviewsCount: listing.reviewsCount,
		views: listing.views,
		createdAt: listing.createdAt,
		updatedAt: listing.updatedAt
	};
}

/**
 * Convert Mongoose document to unlocked listing object
 */
function toUnlockedListing(listing: IListing): UnlockedListing {
	// Destructure to omit agent from spread (agent will be added separately with contact info)
	const { agent: _agent, ...publicListing } = toPublicListing(listing);
	void _agent; // Explicitly mark as intentionally unused

	return {
		...publicListing,
		addressFull: listing.addressFull,
		mapFull: listing.mapFull
	};
}

/**
 * Create a new listing
 *
 * @param agentId - ID of the agent creating the listing
 * @param data - Listing data
 * @returns Created listing
 */
export async function createListing(
	agentId: string,
	data: CreateListingInput
): Promise<PublicListing> {
	await connectDB();

	const listing = await Listing.create({
		...data,
		agentId: new mongoose.Types.ObjectId(agentId),
		status: 'available',
		rating: 0,
		reviewsCount: 0,
		views: 0
	});

	return toPublicListing(listing);
}

/**
 * Update a listing
 *
 * @param listingId - ID of the listing to update
 * @param agentId - ID of the agent (for authorization)
 * @param data - Update data
 * @returns Updated listing
 */
export async function updateListing(
	listingId: string,
	agentId: string,
	data: UpdateListingInput
): Promise<PublicListing> {
	await connectDB();

	// Find listing and verify ownership
	const listing = await Listing.findActiveById(listingId);

	if (!listing) {
		throw new Error('Listing not found');
	}

	if (listing.agentId.toString() !== agentId) {
		throw new Error('You do not have permission to update this listing');
	}

	// Update fields
	Object.assign(listing, data);
	await listing.save();

	return toPublicListing(listing);
}

/**
 * Update listing status (mark as taken/available)
 *
 * @param listingId - ID of the listing
 * @param agentId - ID of the agent (for authorization)
 * @param status - New status
 * @returns Updated listing
 */
export async function updateListingStatus(
	listingId: string,
	agentId: string,
	status: 'available' | 'taken'
): Promise<PublicListing> {
	await connectDB();

	const listing = await Listing.findActiveById(listingId);

	if (!listing) {
		throw new Error('Listing not found');
	}

	if (listing.agentId.toString() !== agentId) {
		throw new Error('You do not have permission to update this listing');
	}

	listing.status = status;
	await listing.save();

	return toPublicListing(listing);
}

/**
 * Get a single listing by ID
 *
 * @param listingId - ID of the listing
 * @param incrementViews - Whether to increment view count
 * @returns Listing or null
 */
export async function getListingById(
	listingId: string,
	incrementViews = true
): Promise<PublicListing | null> {
	await connectDB();

	const listing = await Listing.findActiveById(listingId);

	if (!listing) {
		return null;
	}

	// Increment views if requested
	if (incrementViews) {
		listing.views += 1;
		await listing.save();
	}

	// Fetch agent info
	const agent = await User.findActiveById(listing.agentId.toString());
	let agentInfo: ListingAgent | undefined;

	if (agent) {
		// Get agent's listings count
		const listingsCount = await Listing.countDocuments({
			agentId: listing.agentId,
			isDeleted: false
		});

		agentInfo = {
			id: agent._id.toString(),
			name: agent.name,
			avatarUrl: agent.avatarUrl,
			isVerified: agent.isVerified,
			listingsCount
		};
	}

	return {
		...toPublicListing(listing),
		agent: agentInfo
	};
}

/**
 * Get a listing with unlocked details (for users who have unlocked it)
 *
 * @param listingId - ID of the listing
 * @returns Unlocked listing or null
 */
export async function getUnlockedListing(
	listingId: string
): Promise<UnlockedListing | null> {
	await connectDB();

	const listing = await Listing.findActiveById(listingId);

	if (!listing) {
		return null;
	}

	// Fetch agent info with contact details
	const agent = await User.findActiveById(listing.agentId.toString());
	let agentInfo: ListingAgentUnlocked | undefined;

	if (agent) {
		// Get agent's listings count
		const listingsCount = await Listing.countDocuments({
			agentId: listing.agentId,
			isDeleted: false
		});

		agentInfo = {
			id: agent._id.toString(),
			name: agent.name,
			avatarUrl: agent.avatarUrl,
			isVerified: agent.isVerified,
			listingsCount,
			phone: agent.phone || '',
			email: agent.email
		};
	}

	return {
		...toUnlockedListing(listing),
		agent: agentInfo
	};
}

/**
 * Get paginated listings with filters
 *
 * @param query - Query parameters
 * @returns Paginated listings
 */
export async function getListings(
	query: ListingQueryInput
): Promise<PaginatedListings> {
	await connectDB();

	const {
		page,
		limit,
		search,
		campusArea,
		minPrice,
		maxPrice,
		bedrooms,
		bathrooms,
		status,
		agentId,
		sortBy,
		verifiedAgentsOnly
	} = query;

	// If verifiedAgentsOnly filter is set, get verified agent IDs first
	let verifiedAgentIds: mongoose.Types.ObjectId[] | undefined;
	if (verifiedAgentsOnly) {
		const verifiedAgents = await User.find(
			{ role: 'agent', isVerified: true, isDeleted: false },
			'_id'
		);
		verifiedAgentIds = verifiedAgents.map((a) => a._id);
	}

	// Build filter
	const filter: mongoose.FilterQuery<IListing> = {
		isDeleted: false
	};

	if (campusArea) {
		filter.campusArea = campusArea;
	}

	if (minPrice !== undefined || maxPrice !== undefined) {
		filter.priceMonthly = {};
		if (minPrice !== undefined) filter.priceMonthly.$gte = minPrice;
		if (maxPrice !== undefined) filter.priceMonthly.$lte = maxPrice;
	}

	if (bedrooms) {
		filter.bedrooms = bedrooms;
	}

	if (bathrooms) {
		filter.bathrooms = bathrooms;
	}

	if (status) {
		filter.status = status;
	}

	if (agentId) {
		filter.agentId = new mongoose.Types.ObjectId(agentId);
	}

	// Filter by verified agents
	if (verifiedAgentIds) {
		filter.agentId = { $in: verifiedAgentIds };
	}

	// Text search
	if (search) {
		filter.$text = { $search: search };
	}

	// Build sort
	let sort: Record<string, 1 | -1> = { createdAt: -1 };
	switch (sortBy) {
		case 'oldest':
			sort = { createdAt: 1 };
			break;
		case 'price_low':
			sort = { priceMonthly: 1 };
			break;
		case 'price_high':
			sort = { priceMonthly: -1 };
			break;
		case 'rating':
			sort = { rating: -1 };
			break;
		case 'views':
			sort = { views: -1 };
			break;
		default:
			sort = { createdAt: -1 };
	}

	// Execute query with pagination
	const skip = (page - 1) * limit;

	const [listings, total] = await Promise.all([
		Listing.find(filter)
			.populate('agentId', 'name avatarUrl isVerified')
			.sort(sort)
			.skip(skip)
			.limit(limit),
		Listing.countDocuments(filter)
	]);

	const totalPages = Math.ceil(total / limit);

	// Map listings with agent info
	const listingsWithAgent = listings.map((listing) => {
		const publicListing = toPublicListing(listing);

		// Add agent info if populated
		const agent = listing.agentId as unknown as {
			_id: mongoose.Types.ObjectId;
			name: string;
			avatarUrl?: string;
			isVerified: boolean;
		} | null;

		if (agent && typeof agent === 'object' && agent._id) {
			publicListing.agent = {
				id: agent._id.toString(),
				name: agent.name,
				avatarUrl: agent.avatarUrl,
				isVerified: agent.isVerified
			};
		}

		return publicListing;
	});

	return {
		listings: listingsWithAgent,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1
		}
	};
}

/**
 * Get listings by agent ID
 *
 * @param agentId - Agent ID
 * @returns Agent's listings
 */
export async function getListingsByAgent(
	agentId: string
): Promise<PublicListing[]> {
	await connectDB();

	const listings = await Listing.findByAgent(agentId);
	return listings.map(toPublicListing);
}

/**
 * Soft delete a listing
 *
 * @param listingId - ID of the listing
 * @param agentId - ID of the agent (for authorization)
 */
export async function deleteListing(
	listingId: string,
	agentId: string
): Promise<void> {
	await connectDB();

	const listing = await Listing.findActiveById(listingId);

	if (!listing) {
		throw new Error('Listing not found');
	}

	if (listing.agentId.toString() !== agentId) {
		throw new Error('You do not have permission to delete this listing');
	}

	listing.isDeleted = true;
	listing.deletedAt = new Date();
	await listing.save();
}

/**
 * Check if a listing exists and is active
 *
 * @param listingId - ID of the listing
 * @returns True if listing exists and is active
 */
export async function listingExists(listingId: string): Promise<boolean> {
	await connectDB();
	const listing = await Listing.findActiveById(listingId);
	return listing !== null;
}
