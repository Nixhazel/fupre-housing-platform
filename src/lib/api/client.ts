import axios, {
	type AxiosInstance,
	type AxiosError,
	type InternalAxiosRequestConfig
} from 'axios';
import { ApiError, type ApiResponse } from './types';
import { dispatchAuthEvent } from '@/lib/auth/events';

/**
 * API Client
 *
 * Centralized Axios instance with:
 * - Base URL configuration
 * - Credential handling (cookies)
 * - Response/error normalization
 * - Auth error interception
 */

/**
 * Create and configure Axios instance
 */
function createApiClient(): AxiosInstance {
	const client = axios.create({
		baseURL: '/api',
		timeout: 30000, // 30 seconds
		headers: {
			'Content-Type': 'application/json'
		},
		withCredentials: true // Include cookies in requests
	});

	// Request interceptor
	client.interceptors.request.use(
		(config: InternalAxiosRequestConfig) => {
			// Could add request logging here in development
			if (process.env.NODE_ENV === 'development') {
				console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
			}
			return config;
		},
		(error: AxiosError) => {
			return Promise.reject(error);
		}
	);

	// Response interceptor
	client.interceptors.response.use(
		(response) => {
			// Transform successful responses
			const data = response.data as ApiResponse;

			// If API returns success: false, treat as error
			if (data && data.success === false) {
				throw new ApiError(
					data.error || 'Request failed',
					response.status,
					undefined,
					data.errors
				);
			}

			return response;
		},
		(error: AxiosError<ApiResponse>) => {
			// Handle error responses
			return Promise.reject(normalizeError(error));
		}
	);

	return client;
}

/**
 * Normalize Axios errors to ApiError
 */
function normalizeError(error: AxiosError<ApiResponse>): ApiError {
	// Network error (no response)
	if (!error.response) {
		if (error.code === 'ECONNABORTED') {
			return new ApiError('Request timed out. Please try again.', 0, 'TIMEOUT');
		}
		return new ApiError(
			'Network error. Please check your connection.',
			0,
			'NETWORK_ERROR'
		);
	}

	const { status, data } = error.response;

	// Handle auth errors - dispatch session-expired only on protected routes
	// and only for API calls other than /auth/me (which is handled by useCurrentUser)
	if (status === 401 && typeof window !== 'undefined') {
		const requestUrl = error.config?.url || '';
		const currentPath = window.location.pathname;

		// Protected routes that require authentication
		const protectedPaths = ['/profile', '/dashboard', '/unlock'];
		const isOnProtectedRoute = protectedPaths.some(
			(route) => currentPath === route || currentPath.startsWith(`${route}/`)
		);

		// Don't dispatch for /auth/me - useCurrentUser handles that gracefully
		const isAuthMeRequest = requestUrl.includes('/auth/me');

		// Only dispatch session-expired when on a protected route and NOT for auth/me
		// This prevents false redirects on public pages where 401 is expected for guests
		if (isOnProtectedRoute && !isAuthMeRequest) {
			dispatchAuthEvent('auth:session-expired', {
				returnUrl: currentPath
			});
		}
	}

	// Handle forbidden errors
	if (status === 403 && typeof window !== 'undefined') {
		dispatchAuthEvent('auth:forbidden', {
			resource: error.config?.url
		});
	}

	// Extract error message from response
	const message = data?.error || getDefaultErrorMessage(status);

	return new ApiError(message, status, undefined, data?.errors);
}

/**
 * Get default error message by status code
 */
function getDefaultErrorMessage(status: number): string {
	switch (status) {
		case 400:
			return 'Invalid request. Please check your input.';
		case 401:
			return 'Please log in to continue.';
		case 403:
			return 'You do not have permission to perform this action.';
		case 404:
			return 'The requested resource was not found.';
		case 409:
			return 'This operation conflicts with existing data.';
		case 422:
			return 'The provided data is invalid.';
		case 429:
			return 'Too many requests. Please wait and try again.';
		case 500:
			return 'An unexpected error occurred. Please try again.';
		case 502:
		case 503:
		case 504:
			return 'Service temporarily unavailable. Please try again.';
		default:
			return 'An error occurred. Please try again.';
	}
}

/**
 * Axios client instance
 */
const apiClient = createApiClient();

/**
 * API helper methods
 *
 * All methods return the unwrapped data from ApiResponse
 */
export const api = {
	/**
	 * GET request
	 */
	get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
		const response = await apiClient.get<ApiResponse<T>>(url, { params });
		return response.data.data as T;
	},

	/**
	 * POST request
	 */
	post: async <T>(url: string, data?: unknown): Promise<T> => {
		const response = await apiClient.post<ApiResponse<T>>(url, data);
		return response.data.data as T;
	},

	/**
	 * PATCH request
	 */
	patch: async <T>(url: string, data?: unknown): Promise<T> => {
		const response = await apiClient.patch<ApiResponse<T>>(url, data);
		return response.data.data as T;
	},

	/**
	 * PUT request
	 */
	put: async <T>(url: string, data?: unknown): Promise<T> => {
		const response = await apiClient.put<ApiResponse<T>>(url, data);
		return response.data.data as T;
	},

	/**
	 * DELETE request
	 */
	delete: async <T>(url: string): Promise<T> => {
		const response = await apiClient.delete<ApiResponse<T>>(url);
		return response.data.data as T;
	}
};

/**
 * Build query string from params object
 *
 * Handles arrays, undefined values, etc.
 */
export function buildQueryString(params: Record<string, unknown>): string {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') {
			return;
		}

		if (Array.isArray(value)) {
			value.forEach((v) => searchParams.append(key, String(v)));
		} else {
			searchParams.append(key, String(value));
		}
	});

	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : '';
}

/**
 * Export the raw Axios instance for advanced use cases
 */
export { apiClient };
