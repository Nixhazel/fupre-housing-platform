'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

/**
 * Swagger UI Page
 *
 * Renders interactive API documentation
 * Only available in development mode
 */

// Dynamic import to avoid SSR issues with Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
				<p className="text-gray-600">Loading API Documentation...</p>
			</div>
		</div>
	)
});

export default function ApiDocsPage() {
	// Only show in development
	if (process.env.NODE_ENV === 'production') {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						API Documentation
					</h1>
					<p className="text-gray-600">
						API documentation is only available in development mode.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<SwaggerUI url="/api/docs" />
		</div>
	);
}

