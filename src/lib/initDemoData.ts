/**
 * Initialize demo data for the FUPRE Housing platform
 * This function seeds the stores with initial data
 */

import { useListingsStore } from './store/listingsSlice';
import { useRoommatesStore } from './store/roommatesSlice';
import { usePaymentsStore } from './store/paymentsSlice';
import { listingsData } from '@/data/listings';
import { roommateListingsData } from '@/data/roommates';
import { paymentProofsData } from '@/data/payments';

export function initDemoData() {
	// Initialize listings store
	const listingsStore = useListingsStore.getState();
	if (listingsStore.listings.length === 0) {
		listingsStore.listings = listingsData;
	}

	// Initialize roommates store
	const roommatesStore = useRoommatesStore.getState();
	if (roommatesStore.roommateListings.length === 0) {
		roommatesStore.roommateListings = roommateListingsData;
	}

	// Initialize payments store
	const paymentsStore = usePaymentsStore.getState();
	if (paymentsStore.paymentProofs.length === 0) {
		paymentsStore.paymentProofs = paymentProofsData;
	}
}

/**
 * Reset all demo data
 */
export function resetDemoData() {
	// Clear localStorage
	if (typeof window !== 'undefined') {
		localStorage.removeItem('listings-storage');
		localStorage.removeItem('roommates-storage');
		localStorage.removeItem('payments-storage');
		localStorage.removeItem('auth-storage');
	}

	// Reload the page to reinitialize stores
	if (typeof window !== 'undefined') {
		window.location.reload();
	}
}
