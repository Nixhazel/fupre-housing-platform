'use client';

import { useEffect } from 'react';

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		// Remove browser extension attributes that can cause hydration mismatches
		const removeExtensionAttributes = () => {
			const body = document.body;
			if (body) {
				// Remove Grammarly attributes
				body.removeAttribute('data-new-gr-c-s-check-loaded');
				body.removeAttribute('data-gr-ext-installed');
				body.removeAttribute('data-gramm');
				body.removeAttribute('data-gramm_editor');
				body.removeAttribute('data-gramm_id');
				body.removeAttribute('data-gramm_editor');
				body.removeAttribute('data-gramm_id');

				// Remove other common extension attributes
				body.removeAttribute('data-grammarly-shadow-root');
				body.removeAttribute('data-grammarly-shadow-root');
				body.removeAttribute('data-grammarly-shadow-root');
			}
		};

		// Run multiple times to catch attributes added after initial load
		removeExtensionAttributes();
		const timeouts = [
			setTimeout(removeExtensionAttributes, 50),
			setTimeout(removeExtensionAttributes, 100),
			setTimeout(removeExtensionAttributes, 200),
			setTimeout(removeExtensionAttributes, 500)
		];

		return () => timeouts.forEach(clearTimeout);
	}, []);

	return <>{children}</>;
}
