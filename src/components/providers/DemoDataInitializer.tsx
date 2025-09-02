'use client';

import { useEffect, useState } from 'react';
import { initDemoData } from '@/lib/initDemoData';

export function DemoDataInitializer() {
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Initialize demo data when the app loads
		initDemoData();
		setIsInitialized(true);
	}, []);

	// Don't render anything until initialized
	if (!isInitialized) {
		return null;
	}

	return null;
}
