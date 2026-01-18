import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { isProduction, logger } from '@/lib/config/env';

/**
 * API Response Utilities
 *
 * Standardized response helpers for consistent API responses
 * Production-safe: Never exposes internal errors or stack traces
 */

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	errors?: Record<string, string[]>;
}

/**
 * Create a success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success format
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
	return NextResponse.json(
		{
			success: true,
			data
		},
		{ status }
	);
}

/**
 * Create an error response
 *
 * @param error - Error message
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with error format
 */
export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
	return NextResponse.json(
		{
			success: false,
			error
		},
		{ status }
	);
}

/**
 * Create a validation error response from Zod errors
 *
 * @param zodError - Zod validation error
 * @returns NextResponse with validation errors
 */
export function validationErrorResponse(zodError: ZodError): NextResponse<ApiResponse> {
	const errors: Record<string, string[]> = {};

	for (const issue of zodError.issues) {
		const path = issue.path.join('.') || 'value';
		if (!errors[path]) {
			errors[path] = [];
		}
		errors[path].push(issue.message);
	}

	return NextResponse.json(
		{
			success: false,
			error: 'Validation failed',
			errors
		},
		{ status: 400 }
	);
}

/**
 * Create an unauthorized response
 *
 * @param message - Optional custom message
 * @returns 401 NextResponse
 */
export function unauthorizedResponse(
	message = 'Authentication required'
): NextResponse<ApiResponse> {
	return errorResponse(message, 401);
}

/**
 * Create a forbidden response
 *
 * @param message - Optional custom message
 * @returns 403 NextResponse
 */
export function forbiddenResponse(
	message = 'Insufficient permissions'
): NextResponse<ApiResponse> {
	return errorResponse(message, 403);
}

/**
 * Create a not found response
 *
 * @param message - Optional custom message
 * @returns 404 NextResponse
 */
export function notFoundResponse(
	message = 'Resource not found'
): NextResponse<ApiResponse> {
	return errorResponse(message, 404);
}

/**
 * Create a conflict response (e.g., duplicate resource)
 *
 * @param message - Error message
 * @returns 409 NextResponse
 */
export function conflictResponse(message: string): NextResponse<ApiResponse> {
	return errorResponse(message, 409);
}

/**
 * Create an internal server error response
 *
 * @param error - Original error (logged, not exposed to client)
 * @returns 500 NextResponse
 */
export function serverErrorResponse(error?: unknown): NextResponse<ApiResponse> {
	// Log the actual error (respects production mode)
	if (error) {
		logger.error('Server error', error);
	}

	// Never expose internal error details to client
	return errorResponse('An unexpected error occurred', 500);
}

/**
 * Handle known errors and return appropriate response
 *
 * @param error - Error to handle
 * @returns NextResponse with appropriate error
 */
export function handleError(error: unknown): NextResponse<ApiResponse> {
	// Zod validation errors
	if (error instanceof ZodError) {
		return validationErrorResponse(error);
	}

	// Known error messages
	if (error instanceof Error) {
		const message = error.message.toLowerCase();

		if (message.includes('not found')) {
			// Safe to expose "not found" errors
			return notFoundResponse(error.message);
		}

		if (message.includes('already exists') || message.includes('duplicate')) {
			// Safe to expose conflict errors
			return conflictResponse(error.message);
		}

		if (message.includes('unauthorized') || message.includes('authentication')) {
			// Use generic message in production
			return unauthorizedResponse(
				isProduction ? 'Authentication required' : error.message
			);
		}

		if (message.includes('forbidden') || message.includes('permission')) {
			// Use generic message in production
			return forbiddenResponse(
				isProduction ? 'Insufficient permissions' : error.message
			);
		}

		if (message.includes('invalid') || message.includes('validation')) {
			return errorResponse(error.message, 400);
		}

		// Database errors - don't expose details
		if (message.includes('mongo') || message.includes('database')) {
			logger.error('Database error', error);
			return serverErrorResponse();
		}
	}

	// Unknown errors - never expose details
	return serverErrorResponse(error);
}

