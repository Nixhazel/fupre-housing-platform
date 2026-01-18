import mongoose from 'mongoose';
import connectDB from '@/lib/db/connect';
import Listing from '@/lib/db/models/Listing';
import PaymentProof, { PaymentStatus } from '@/lib/db/models/PaymentProof';

/**
 * Agents Service
 *
 * Business logic for agent dashboard and metrics
 */

import { PLATFORM_CONFIG } from '@/lib/config/env';

const UNLOCK_FEE = PLATFORM_CONFIG.UNLOCK_FEE;

/**
 * Get agent stats
 */
export async function getAgentStats(agentId: string) {
	await connectDB();

	const agentObjectId = new mongoose.Types.ObjectId(agentId);

	// Get listing stats
	const [listingStats] = await Listing.aggregate([
		{
			$match: {
				agentId: agentObjectId,
				isDeleted: false
			}
		},
		{
			$group: {
				_id: null,
				totalListings: { $sum: 1 },
				activeListings: {
					$sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
				},
				totalViews: { $sum: '$views' }
			}
		}
	]);

	// Get unlock stats (approved payment proofs for agent's listings)
	const [unlockStats] = await PaymentProof.aggregate([
		{
			$match: { status: PaymentStatus.APPROVED }
		},
		{
			$lookup: {
				from: 'listings',
				localField: 'listingId',
				foreignField: '_id',
				as: 'listing'
			}
		},
		{
			$unwind: '$listing'
		},
		{
			$match: {
				'listing.agentId': agentObjectId,
				'listing.isDeleted': false
			}
		},
		{
			$group: {
				_id: null,
				totalUnlocks: { $sum: 1 }
			}
		}
	]);

	const stats = {
		totalListings: listingStats?.totalListings || 0,
		activeListings: listingStats?.activeListings || 0,
		totalViews: listingStats?.totalViews || 0,
		totalUnlocks: unlockStats?.totalUnlocks || 0,
		totalEarnings: (unlockStats?.totalUnlocks || 0) * UNLOCK_FEE
	};

	return stats;
}

/**
 * Get agent earnings by month
 */
export async function getAgentEarnings(agentId: string, months: number = 6) {
	await connectDB();

	const agentObjectId = new mongoose.Types.ObjectId(agentId);

	// Calculate date range (last N months)
	const endDate = new Date();
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	const earnings = await PaymentProof.aggregate([
		{
			$match: {
				status: PaymentStatus.APPROVED,
				reviewedAt: { $gte: startDate, $lte: endDate }
			}
		},
		{
			$lookup: {
				from: 'listings',
				localField: 'listingId',
				foreignField: '_id',
				as: 'listing'
			}
		},
		{
			$unwind: '$listing'
		},
		{
			$match: {
				'listing.agentId': agentObjectId,
				'listing.isDeleted': false
			}
		},
		{
			$group: {
				_id: {
					year: { $year: '$reviewedAt' },
					month: { $month: '$reviewedAt' }
				},
				unlocks: { $sum: 1 },
				amount: { $sum: UNLOCK_FEE }
			}
		},
		{
			$sort: { '_id.year': 1, '_id.month': 1 }
		},
		{
			$project: {
				_id: 0,
				year: '$_id.year',
				month: '$_id.month',
				unlocks: 1,
				amount: 1
			}
		}
	]);

	// Convert to month names and fill in missing months
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const result: { month: string; unlocks: number; amount: number }[] = [];

	// Generate all months in range
	const current = new Date(startDate);
	while (current <= endDate) {
		const year = current.getFullYear();
		const month = current.getMonth() + 1;
		const monthLabel = `${monthNames[month - 1]} ${year}`;

		const found = earnings.find(
			(e: { year: number; month: number }) => e.year === year && e.month === month
		);

		result.push({
			month: monthLabel,
			unlocks: found?.unlocks || 0,
			amount: found?.amount || 0
		});

		current.setMonth(current.getMonth() + 1);
	}

	return result;
}

/**
 * Get agent's listings with stats
 */
export async function getAgentListings(
	agentId: string,
	options: { page: number; limit: number; status?: string }
) {
	await connectDB();

	const filter: Record<string, unknown> = {
		agentId: new mongoose.Types.ObjectId(agentId),
		isDeleted: false
	};

	if (options.status) {
		filter.status = options.status;
	}

	const skip = (options.page - 1) * options.limit;

	const [listings, total] = await Promise.all([
		Listing.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(options.limit)
			.lean(),
		Listing.countDocuments(filter)
	]);

	// Get unlock counts for each listing
	const listingIds = listings.map((l) => l._id);
	const unlockCounts = await PaymentProof.aggregate([
		{
			$match: {
				listingId: { $in: listingIds },
				status: PaymentStatus.APPROVED
			}
		},
		{
			$group: {
				_id: '$listingId',
				count: { $sum: 1 }
			}
		}
	]);

	const unlockMap = new Map(
		unlockCounts.map((u: { _id: mongoose.Types.ObjectId; count: number }) => [
			u._id.toString(),
			u.count
		])
	);

	const listingsWithStats = listings.map((listing) => ({
		...listing,
		id: listing._id.toString(),
		unlockCount: unlockMap.get(listing._id.toString()) || 0,
		earnings: (unlockMap.get(listing._id.toString()) || 0) * UNLOCK_FEE
	}));

	return {
		listings: listingsWithStats,
		pagination: {
			page: options.page,
			limit: options.limit,
			total,
			totalPages: Math.ceil(total / options.limit)
		}
	};
}

