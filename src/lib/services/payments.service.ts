import mongoose from 'mongoose';
import connectDB from '@/lib/db/connect';
import PaymentProof, { PaymentStatus } from '@/lib/db/models/PaymentProof';
import Listing from '@/lib/db/models/Listing';
import User, { UserRole } from '@/lib/db/models/User';
import type {
	SubmitPaymentProofInput,
	ReviewPaymentProofInput
} from '@/lib/validators/payments.server';
import { env, PLATFORM_CONFIG, logger } from '@/lib/config/env';
import {
	sendNewPaymentProofNotification,
	sendPaymentApprovedEmail,
	sendPaymentRejectedEmail
} from '@/lib/email';

/**
 * Payment Proofs Service
 *
 * Business logic for payment proof operations
 */

const UNLOCK_FEE = PLATFORM_CONFIG.UNLOCK_FEE;

/**
 * Get all admin emails for notifications
 */
async function getAdminEmails(): Promise<string[]> {
	const admins = await User.find({ role: UserRole.ADMIN }, 'email');
	return admins.map((admin) => admin.email);
}

/**
 * Submit a new payment proof
 */
export async function submitPaymentProof(
	userId: string,
	input: SubmitPaymentProofInput
) {
	await connectDB();

	// Verify listing exists and is active
	const listing = await Listing.findActiveById(input.listingId);
	if (!listing) {
		throw new Error('Listing not found');
	}

	// Check if user already has an approved proof for this listing
	const hasApproved = await PaymentProof.hasApprovedProof(
		userId,
		input.listingId
	);
	if (hasApproved) {
		throw new Error('You have already unlocked this listing');
	}

	// Check if user has a pending proof for this listing
	const hasPending = await PaymentProof.hasPendingProof(
		userId,
		input.listingId
	);
	if (hasPending) {
		throw new Error(
			'You already have a pending payment proof for this listing'
		);
	}

	// Get user info for notification
	const user = await User.findById(userId, 'name email');
	if (!user) {
		throw new Error('User not found');
	}

	// Create payment proof
	const proof = await PaymentProof.create({
		userId: new mongoose.Types.ObjectId(userId),
		listingId: new mongoose.Types.ObjectId(input.listingId),
		amount: UNLOCK_FEE,
		method: input.method,
		reference: input.reference,
		imageUrl: input.imageUrl,
		status: PaymentStatus.PENDING
	});

	// Send notification to all admins (non-blocking, fire and forget)
	(async () => {
		try {
			const adminEmails = await getAdminEmails();
			if (adminEmails.length > 0) {
				const emailResults = await sendNewPaymentProofNotification(
					adminEmails,
					{
						userName: user.name,
						userEmail: user.email,
						listingTitle: listing.title,
						amount: UNLOCK_FEE,
						reference: input.reference,
						adminDashboardUrl: `${env.appUrl}/dashboard/admin`
					}
				);
				const successCount = emailResults.filter((r) => r.success).length;
				const failedCount = emailResults.length - successCount;
				if (successCount > 0) {
					logger.info(
						`Admin notifications sent for payment proof ${proof.id}: ${successCount} sent, ${failedCount} failed`
					);
				}
				if (failedCount > 0) {
					const failedErrors = emailResults
						.filter((r) => !r.success)
						.map((r) => r.error)
						.join(', ');
					logger.error(
						`Some admin notifications failed for payment proof ${proof.id}: ${failedErrors}`
					);
				}
			} else {
				logger.warn('No admin emails found to send payment proof notification');
			}
		} catch (error) {
			logger.error(
				'Exception sending admin notification for payment proof',
				error
			);
		}
	})();

	return proof;
}

/**
 * Get payment proofs for the current user
 */
export async function getUserPaymentProofs(
	userId: string,
	options: { page: number; limit: number; status?: string }
) {
	await connectDB();

	const query: Record<string, unknown> = { userId };

	if (options.status) {
		query.status = options.status;
	}

	const skip = (options.page - 1) * options.limit;

	const [proofs, total] = await Promise.all([
		PaymentProof.find(query)
			.populate('listingId', 'title coverPhoto priceYearly university location')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(options.limit),
		PaymentProof.countDocuments(query)
	]);

	return {
		proofs,
		pagination: {
			page: options.page,
			limit: options.limit,
			total,
			totalPages: Math.ceil(total / options.limit)
		}
	};
}

/**
 * Get pending payment proofs (admin only)
 */
export async function getPendingPaymentProofs(options: {
	page: number;
	limit: number;
}) {
	await connectDB();

	const skip = (options.page - 1) * options.limit;

	const [proofs, total] = await Promise.all([
		PaymentProof.find({ status: PaymentStatus.PENDING })
			.populate('userId', 'name email phone')
			.populate('listingId', 'title coverPhoto priceYearly university location agentId')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(options.limit),
		PaymentProof.countDocuments({ status: PaymentStatus.PENDING })
	]);

	return {
		proofs,
		pagination: {
			page: options.page,
			limit: options.limit,
			total,
			totalPages: Math.ceil(total / options.limit)
		}
	};
}

/**
 * Get a single payment proof by ID
 */
export async function getPaymentProofById(
	proofId: string,
	requesterId: string,
	requesterRole: string
) {
	await connectDB();

	const proof = await PaymentProof.findById(proofId)
		.populate('userId', 'name email phone')
		.populate('listingId', 'title coverPhoto priceYearly university location agentId');

	if (!proof) {
		throw new Error('Payment proof not found');
	}

	// Check access: owner or admin
	const isOwner = proof.userId._id.toString() === requesterId;
	const isAdmin = requesterRole === 'admin';

	if (!isOwner && !isAdmin) {
		throw new Error('You do not have permission to view this proof');
	}

	return proof;
}

/**
 * Review (approve/reject) a payment proof (admin only)
 */
export async function reviewPaymentProof(
	proofId: string,
	adminId: string,
	input: ReviewPaymentProofInput
) {
	await connectDB();

	const proof = await PaymentProof.findById(proofId)
		.populate('userId', 'name email')
		.populate('listingId', 'title');

	if (!proof) {
		throw new Error('Payment proof not found');
	}

	if (proof.status !== PaymentStatus.PENDING) {
		throw new Error('This payment proof has already been reviewed');
	}

	// Get user and listing info before updating
	const user = proof.userId as unknown as {
		_id: mongoose.Types.ObjectId;
		name: string;
		email: string;
	};
	const listing = proof.listingId as unknown as {
		_id: mongoose.Types.ObjectId;
		title: string;
	};

	// Update proof status
	proof.status = input.status;
	proof.reviewedByAdminId = new mongoose.Types.ObjectId(adminId);
	proof.reviewedAt = new Date();

	if (input.status === 'rejected' && input.rejectionReason) {
		proof.rejectionReason = input.rejectionReason;
	}

	await proof.save();

	// If approved, add listing to user's unlockedListingIds
	if (input.status === 'approved') {
		await User.findByIdAndUpdate(user._id, {
			$addToSet: { unlockedListingIds: listing._id }
		});

		// Send approval email to user (non-blocking, fire and forget)
		if (user.email && user.name && listing.title) {
			(async () => {
				try {
					logger.info(
						`Attempting to send payment approved email to ${user.email} for listing: ${listing.title}`
					);
					const emailResult = await sendPaymentApprovedEmail(user.email, {
						name: user.name,
						listingTitle: listing.title,
						listingUrl: `${env.appUrl}/listings/${listing._id}`
					});
					if (emailResult.success) {
						logger.info(
							`Payment approved email sent to ${user.email}, messageId: ${emailResult.messageId}`
						);
					} else {
						logger.error(
							`Payment approved email failed for ${user.email}: ${emailResult.error}`
						);
					}
				} catch (error) {
					logger.error(
						`Exception sending payment approved email to ${user.email}`,
						error
					);
				}
			})();
		} else {
			logger.error(
				`Cannot send payment approved email - missing data. User: ${JSON.stringify(
					{ email: user.email, name: user.name }
				)}, Listing: ${listing.title}`
			);
		}
	} else if (input.status === 'rejected') {
		// Send rejection email to user (non-blocking, fire and forget)
		if (user.email && user.name && listing.title) {
			(async () => {
				try {
					logger.info(
						`Attempting to send payment rejected email to ${user.email} for listing: ${listing.title}`
					);
					const emailResult = await sendPaymentRejectedEmail(user.email, {
						name: user.name,
						listingTitle: listing.title,
						reason: input.rejectionReason,
						listingUrl: `${env.appUrl}/listings/${listing._id}`
					});
					if (emailResult.success) {
						logger.info(
							`Payment rejected email sent to ${user.email}, messageId: ${emailResult.messageId}`
						);
					} else {
						logger.error(
							`Payment rejected email failed for ${user.email}: ${emailResult.error}`
						);
					}
				} catch (error) {
					logger.error(
						`Exception sending payment rejected email to ${user.email}`,
						error
					);
				}
			})();
		} else {
			logger.error(
				`Cannot send payment rejected email - missing data. User: ${JSON.stringify(
					{ email: user.email, name: user.name }
				)}, Listing: ${listing.title}`
			);
		}
	}

	// Return updated proof with populated fields
	return PaymentProof.findById(proofId)
		.populate('userId', 'name email phone')
		.populate('listingId', 'title coverPhoto priceYearly university location');
}

/**
 * Get proofs for a specific listing (for agents to see who unlocked)
 */
export async function getProofsByListing(
	listingId: string,
	agentId: string,
	options: { page: number; limit: number }
) {
	await connectDB();

	// Verify the agent owns the listing
	const listing = await Listing.findActiveById(listingId);
	if (!listing) {
		throw new Error('Listing not found');
	}

	if (listing.agentId.toString() !== agentId) {
		throw new Error(
			'You do not have permission to view proofs for this listing'
		);
	}

	const skip = (options.page - 1) * options.limit;

	const [proofs, total] = await Promise.all([
		PaymentProof.find({ listingId, status: PaymentStatus.APPROVED })
			.populate('userId', 'name email phone')
			.sort({ reviewedAt: -1 })
			.skip(skip)
			.limit(options.limit),
		PaymentProof.countDocuments({ listingId, status: PaymentStatus.APPROVED })
	]);

	return {
		proofs,
		pagination: {
			page: options.page,
			limit: options.limit,
			total,
			totalPages: Math.ceil(total / options.limit)
		}
	};
}

/**
 * Check if user has unlocked a listing
 */
export async function hasUnlockedListing(
	userId: string,
	listingId: string
): Promise<boolean> {
	await connectDB();
	return PaymentProof.hasApprovedProof(userId, listingId);
}
