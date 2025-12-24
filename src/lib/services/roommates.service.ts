import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import connectDB from '@/lib/db/connect';
import RoommateListing, { IRoommateListing } from '@/lib/db/models/RoommateListing';
import User from '@/lib/db/models/User';
import type {
	CreateRoommateListingInput,
	UpdateRoommateListingInput,
	RoommateQueryInput
} from '@/lib/validators/roommates.server';

/**
 * Roommates Service
 *
 * Business logic for roommate listing operations
 */

/**
 * Get roommate listings with filters and pagination
 */
export async function getRoommateListings(query: RoommateQueryInput) {
	await connectDB();

	const filter: FilterQuery<IRoommateListing> = { isDeleted: false };

	// Budget range filter
	if (query.minBudget !== undefined || query.maxBudget !== undefined) {
		filter.budgetMonthly = {};
		if (query.minBudget !== undefined) {
			filter.budgetMonthly.$gte = query.minBudget;
		}
		if (query.maxBudget !== undefined) {
			filter.budgetMonthly.$lte = query.maxBudget;
		}
	}

	// Gender preference filter
	if (query.gender) {
		filter['preferences.gender'] = query.gender;
	}

	// Cleanliness preference filter
	if (query.cleanliness) {
		filter['preferences.cleanliness'] = query.cleanliness;
	}

	// Text search
	if (query.search) {
		filter.$text = { $search: query.search };
	}

	// Sorting
	let sort: { [key: string]: SortOrder } = { createdAt: -1 };
	switch (query.sortBy) {
		case 'oldest':
			sort = { createdAt: 1 };
			break;
		case 'budget_low':
			sort = { budgetMonthly: 1 };
			break;
		case 'budget_high':
			sort = { budgetMonthly: -1 };
			break;
		case 'newest':
		default:
			sort = { createdAt: -1 };
	}

	const skip = (query.page - 1) * query.limit;

	const [listings, total] = await Promise.all([
		RoommateListing.find(filter)
			.populate('ownerId', 'name avatarUrl phone')
			.sort(sort)
			.skip(skip)
			.limit(query.limit),
		RoommateListing.countDocuments(filter)
	]);

	return {
		listings,
		pagination: {
			page: query.page,
			limit: query.limit,
			total,
			totalPages: Math.ceil(total / query.limit)
		}
	};
}

/**
 * Get a single roommate listing by ID with owner populated
 */
export async function getRoommateListingById(id: string, includeOwner = true) {
	await connectDB();

	let listing = await RoommateListing.findActiveById(id);
	if (!listing) {
		throw new Error('Roommate listing not found');
	}

	// Populate owner if requested
	if (includeOwner) {
		listing = await listing.populate('ownerId', 'name email phone avatarUrl role isVerified createdAt');
	}

	return listing;
}

/**
 * Create a new roommate listing
 */
export async function createRoommateListing(
	userId: string,
	input: CreateRoommateListingInput
) {
	await connectDB();

	// Get user to determine owner type
	const user = await User.findActiveById(userId);
	if (!user) {
		throw new Error('User not found');
	}

	// Validate user can create roommate listings (student or owner)
	if (!['student', 'owner'].includes(user.role)) {
		throw new Error('Only students and property owners can create roommate listings');
	}

	const listing = await RoommateListing.create({
		ownerId: new mongoose.Types.ObjectId(userId),
		ownerType: user.role as 'student' | 'owner',
		title: input.title,
		budgetMonthly: input.budgetMonthly,
		moveInDate: new Date(input.moveInDate),
		description: input.description,
		photos: input.photos,
		preferences: input.preferences
	});

	// Populate owner details before returning
	await listing.populate('ownerId', 'name avatarUrl phone');

	return listing;
}

/**
 * Update a roommate listing
 */
export async function updateRoommateListing(
	listingId: string,
	userId: string,
	input: UpdateRoommateListingInput
) {
	await connectDB();

	const listing = await RoommateListing.findActiveById(listingId);
	if (!listing) {
		throw new Error('Roommate listing not found');
	}

	// Check ownership
	if (listing.ownerId._id.toString() !== userId) {
		throw new Error('You do not have permission to update this listing');
	}

	// Update fields
	if (input.title !== undefined) listing.title = input.title;
	if (input.budgetMonthly !== undefined) listing.budgetMonthly = input.budgetMonthly;
	if (input.moveInDate !== undefined) listing.moveInDate = new Date(input.moveInDate);
	if (input.description !== undefined) listing.description = input.description;
	if (input.photos !== undefined) listing.photos = input.photos;
	if (input.preferences !== undefined) {
		listing.preferences = { ...listing.preferences, ...input.preferences };
	}

	await listing.save();

	return listing;
}

/**
 * Delete (soft) a roommate listing
 */
export async function deleteRoommateListing(listingId: string, userId: string) {
	await connectDB();

	const listing = await RoommateListing.findActiveById(listingId);
	if (!listing) {
		throw new Error('Roommate listing not found');
	}

	// Check ownership
	if (listing.ownerId._id.toString() !== userId) {
		throw new Error('You do not have permission to delete this listing');
	}

	// Soft delete
	listing.isDeleted = true;
	listing.deletedAt = new Date();
	await listing.save();

	return { message: 'Roommate listing deleted successfully' };
}

/**
 * Get roommate listings by owner
 */
export async function getRoommateListingsByOwner(
	ownerId: string,
	options: { page: number; limit: number }
) {
	await connectDB();

	const skip = (options.page - 1) * options.limit;

	const [listings, total] = await Promise.all([
		RoommateListing.find({ ownerId, isDeleted: false })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(options.limit),
		RoommateListing.countDocuments({ ownerId, isDeleted: false })
	]);

	return {
		listings,
		pagination: {
			page: options.page,
			limit: options.limit,
			total,
			totalPages: Math.ceil(total / options.limit)
		}
	};
}

