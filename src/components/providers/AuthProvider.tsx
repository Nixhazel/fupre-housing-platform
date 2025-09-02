'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authSlice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isHydrated, setIsHydrated] = useState(false);
	// Access auth store to ensure it's hydrated
	useAuthStore();

	useEffect(() => {
		// Mark as hydrated after client-side mount
		setIsHydrated(true);
	}, []);

	// Don't render children until hydrated to prevent hydration mismatches
	if (!isHydrated) {
		return null;
	}

	return <>{children}</>;
}
