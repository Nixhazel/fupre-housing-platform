/**
 * Hydration utilities for Zustand stores
 * Helps prevent hydration mismatches between server and client
 */

import { useEffect, useState } from 'react';

export function useHydration() {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	return isHydrated;
}

export function useClientOnly() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return isClient;
}
