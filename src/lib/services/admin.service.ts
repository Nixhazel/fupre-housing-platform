import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Listing from '@/lib/db/models/Listing';
import RoommateListing from '@/lib/db/models/RoommateListing';
import PaymentProof from '@/lib/db/models/PaymentProof';
import { sendAgentVerifiedEmail } from '@/lib/email';
import { env, PLATFORM_CONFIG, logger } from '@/lib/config/env';

/**
 * Admin Service
 *
 * Business logic for admin operations
 */

const UNLOCK_FEE = PLATFORM_CONFIG.UNLOCK_FEE;

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats() {
	await connectDB();

	const [
		totalUsers,
		usersByRole,
		totalListings,
		activeListings,
		totalRoommates,
		proofsByStatus
	] = await Promise.all([
		// Total users
		User.countDocuments({ isDeleted: false }),

		// Users by role
		User.aggregate([
			{ $match: { isDeleted: false } },
			{ $group: { _id: '$role', count: { $sum: 1 } } }
		]),

		// Total listings
		Listing.countDocuments({ isDeleted: false }),

		// Active listings
		Listing.countDocuments({ isDeleted: false, status: 'available' }),

		// Total roommate listings
		RoommateListing.countDocuments({ isDeleted: false }),

		// Payment proofs by status
		PaymentProof.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
	]);

	// Convert arrays to objects
	const roleMap: Record<string, number> = {};
	usersByRole.forEach((r: { _id: string; count: number }) => {
		roleMap[r._id] = r.count;
	});

	const proofMap: Record<string, number> = {};
	proofsByStatus.forEach((p: { _id: string; count: number }) => {
		proofMap[p._id] = p.count;
	});

	return {
		totalUsers,
		usersByRole: {
			student: roleMap.student || 0,
			agent: roleMap.agent || 0,
			owner: roleMap.owner || 0,
			admin: roleMap.admin || 0
		},
		totalListings,
		activeListings,
		totalRoommates,
		pendingProofs: proofMap.pending || 0,
		approvedProofs: proofMap.approved || 0,
		rejectedProofs: proofMap.rejected || 0,
		totalRevenue: (proofMap.approved || 0) * UNLOCK_FEE
	};
}

/**
 * Get users list with filters and pagination
 */
export async function getUsers(options: {
	page: number;
	limit: number;
	role?: string;
	search?: string;
	verified?: boolean;
}) {
	await connectDB();

	const filter: Record<string, unknown> = { isDeleted: false };

	if (options.role) {
		filter.role = options.role;
	}

	if (options.verified !== undefined) {
		filter.isVerified = options.verified;
	}

	if (options.search) {
		filter.$or = [
			{ name: { $regex: options.search, $options: 'i' } },
			{ email: { $regex: options.search, $options: 'i' } }
		];
	}

	const skip = (options.page - 1) * options.limit;

	const [users, total] = await Promise.all([
		User.find(filter)
			.select('-password -emailVerificationToken -passwordResetToken')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(options.limit),
		User.countDocuments(filter)
	]);

	return {
		users,
		pagination: {
			page: options.page,
			limit: options.limit,
			total,
			totalPages: Math.ceil(total / options.limit)
		}
	};
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId: string) {
	await connectDB();

	const user = await User.findById(userId).select(
		'-password -emailVerificationToken -passwordResetToken'
	);

	if (!user || user.isDeleted) {
		throw new Error('User not found');
	}

	return user;
}

/**
 * Update user (admin operations)
 */
export async function updateUser(
	userId: string,
	input: { isVerified?: boolean; role?: string }
) {
	await connectDB();

	const user = await User.findActiveById(userId);
	if (!user) {
		throw new Error('User not found');
	}

	// Track if user is being newly verified (for email notification)
	const wasVerified = user.isVerified;
	const isBeingVerified =
		input.isVerified === true && !wasVerified && user.role === 'agent';

	// Update allowed fields
	if (input.isVerified !== undefined) {
		user.isVerified = input.isVerified;
	}

	// Role change (be careful with this)
	if (input.role && ['student', 'agent', 'owner'].includes(input.role)) {
		user.role = input.role as 'student' | 'agent' | 'owner' | 'admin';
	}

	await user.save();

	// Send verification email if agent is newly verified (non-blocking)
	if (isBeingVerified) {
		(async () => {
			try {
				const emailResult = await sendAgentVerifiedEmail(user.email, {
					name: user.name,
					dashboardUrl: `${env.appUrl}/dashboard/agent`
				});
				if (emailResult.success) {
					logger.info(
						`Agent verification email sent to ${user.email}, messageId: ${emailResult.messageId}`
					);
				} else {
					logger.error(
						`Agent verification email failed for ${user.email}: ${emailResult.error}`
					);
				}
			} catch (error) {
				logger.error(
					`Exception sending agent verification email to ${user.email}`,
					error
				);
			}
		})();
	}

	return user.toSafeObject();
}

/**
 * Soft delete a user
 */
export async function deleteUser(userId: string, adminId: string) {
	await connectDB();

	// Prevent self-deletion
	if (userId === adminId) {
		throw new Error('Cannot delete your own account');
	}

	const user = await User.findActiveById(userId);
	if (!user) {
		throw new Error('User not found');
	}

	// Prevent deleting other admins
	if (user.role === 'admin') {
		throw new Error('Cannot delete admin accounts');
	}

	// Soft delete
	user.isDeleted = true;
	user.deletedAt = new Date();
	await user.save();

	return { message: 'User deleted successfully' };
}

/**
 * Verify an agent
 */
export async function verifyAgent(agentId: string) {
	await connectDB();

	const user = await User.findActiveById(agentId);
	if (!user) {
		throw new Error('User not found');
	}

	if (user.role !== 'agent') {
		throw new Error('User is not an agent');
	}

	user.isVerified = true;
	await user.save();

	return user.toSafeObject();
}

/**
 * Get recent activity for admin dashboard
 */
export async function getRecentActivity(limit: number = 10) {
	await connectDB();

	const [recentUsers, recentListings, recentProofs] = await Promise.all([
		User.find({ isDeleted: false })
			.select('name email role createdAt')
			.sort({ createdAt: -1 })
			.limit(limit),

		Listing.find({ isDeleted: false })
			.select('title campusArea status createdAt')
			.populate('agentId', 'name')
			.sort({ createdAt: -1 })
			.limit(limit),

		PaymentProof.find()
			.populate('userId', 'name')
			.populate('listingId', 'title')
			.sort({ createdAt: -1 })
			.limit(limit)
	]);

	return {
		recentUsers,
		recentListings,
		recentProofs
	};
}
