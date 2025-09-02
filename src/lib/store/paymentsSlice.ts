import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentProof, PaymentProofForm, PaymentStatus } from '@/types';

interface PaymentsSlice {
	paymentProofs: PaymentProof[];

	// Actions
	createPaymentProof: (
		proof: PaymentProofForm & { listingId: string; userId: string }
	) => void;
	updatePaymentStatus: (
		id: string,
		status: PaymentStatus,
		reviewedBy?: string
	) => void;
	getPaymentProofsByUser: (userId: string) => PaymentProof[];
	getPaymentProofsByListing: (listingId: string) => PaymentProof[];
	getPendingProofs: () => PaymentProof[];
	isListingUnlocked: (listingId: string, userId: string) => boolean;
}

export const usePaymentsStore = create<PaymentsSlice>()(
	persist(
		(set, get) => ({
			paymentProofs: [],

			createPaymentProof: (proofData) => {
				const newProof: PaymentProof = {
					id: `proof-${Math.random().toString(36).substr(2, 9)}`,
					...proofData,
					status: 'pending',
					submittedAt: new Date().toISOString()
				};

				set((state) => ({
					paymentProofs: [newProof, ...state.paymentProofs]
				}));
			},

			updatePaymentStatus: (id, status, reviewedBy) => {
				set((state) => ({
					paymentProofs: state.paymentProofs.map((proof) =>
						proof.id === id
							? {
									...proof,
									status,
									reviewedByAdminId: reviewedBy,
									reviewedAt: new Date().toISOString()
							  }
							: proof
					)
				}));

				// If approved, add to user's unlocked listings
				if (status === 'approved') {
					const proof = get().paymentProofs.find((p) => p.id === id);
					if (proof) {
						// Update auth store to add unlocked listing
						// Note: This would need to be handled differently in a real app
						// to avoid circular dependencies
					}
				}
			},

			getPaymentProofsByUser: (userId) => {
				return get().paymentProofs.filter((proof) => proof.userId === userId);
			},

			getPaymentProofsByListing: (listingId) => {
				return get().paymentProofs.filter(
					(proof) => proof.listingId === listingId
				);
			},

			getPendingProofs: () => {
				return get().paymentProofs.filter(
					(proof) => proof.status === 'pending'
				);
			},

			isListingUnlocked: (listingId, userId) => {
				const proofs = get().paymentProofs;
				return proofs.some(
					(proof) =>
						proof.listingId === listingId &&
						proof.userId === userId &&
						proof.status === 'approved'
				);
			}
		}),
		{
			name: 'payments-storage',
			partialize: (state) => ({
				paymentProofs: state.paymentProofs
			}),
			skipHydration: true
		}
	)
);
