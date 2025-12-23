import { NextResponse, type NextRequest } from 'next/server';
import {
	verifyAccessToken,
	verifyRefreshToken,
	createAccessToken,
	type TokenPayload
} from './jwt';
import {
	getAccessTokenFromRequest,
	getRefreshTokenFromRequest,
	ACCESS_TOKEN_COOKIE,
	accessTokenCookieOptions
} from './cookies';

/**
 * Route Guards & Middleware Utilities
 *
 * Provides authentication and authorization guards for API routes
 */

/**
 * Auth context passed to protected route handlers
 */
export interface AuthContext {
	user: {
		userId: string;
		email: string;
		role: 'student' | 'agent' | 'owner' | 'admin';
	};
	tokenPayload: TokenPayload;
}

/**
 * Protected route handler type
 */
export type ProtectedRouteHandler = (
	request: NextRequest,
	context: AuthContext
) => Promise<NextResponse>;

/**
 * Role-based route handler type
 */
export type RoleBasedRouteHandler = (
	request: NextRequest,
	context: AuthContext
) => Promise<NextResponse>;

/**
 * Authenticate a request and return user context
 *
 * @param request - Incoming request
 * @returns Auth context or null if not authenticated
 */
export async function authenticateRequest(
	request: NextRequest
): Promise<{ context: AuthContext; newAccessToken?: string } | null> {
	const accessToken = getAccessTokenFromRequest(request);
	const refreshToken = getRefreshTokenFromRequest(request);

	// Try access token first
	if (accessToken) {
		try {
			const payload = await verifyAccessToken(accessToken);
			return {
				context: {
					user: {
						userId: payload.userId,
						email: payload.email,
						role: payload.role
					},
					tokenPayload: payload
				}
			};
		} catch {
			// Access token invalid, try refresh
		}
	}

	// Try refresh token to get new access token
	if (refreshToken) {
		try {
			const payload = await verifyRefreshToken(refreshToken);
			const newAccessToken = await createAccessToken({
				userId: payload.userId,
				email: payload.email,
				role: payload.role
			});

			return {
				context: {
					user: {
						userId: payload.userId,
						email: payload.email,
						role: payload.role
					},
					tokenPayload: payload
				},
				newAccessToken
			};
		} catch {
			// Refresh token also invalid
		}
	}

	return null;
}

/**
 * Create a protected route handler
 * Requires authentication, returns 401 if not authenticated
 *
 * @param handler - Route handler function
 * @returns Wrapped handler with authentication
 */
export function withAuth(handler: ProtectedRouteHandler) {
	return async (request: NextRequest): Promise<NextResponse> => {
		const auth = await authenticateRequest(request);

		if (!auth) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Call the handler
		const response = await handler(request, auth.context);

		// If we generated a new access token, set it in the response
		if (auth.newAccessToken) {
			response.cookies.set(
				ACCESS_TOKEN_COOKIE,
				auth.newAccessToken,
				accessTokenCookieOptions
			);
		}

		return response;
	};
}

/**
 * Create a role-protected route handler
 * Requires authentication AND specific role(s)
 *
 * @param allowedRoles - Array of allowed roles
 * @param handler - Route handler function
 * @returns Wrapped handler with authentication and authorization
 */
export function withRole(
	allowedRoles: ('student' | 'agent' | 'owner' | 'admin')[],
	handler: RoleBasedRouteHandler
) {
	return async (request: NextRequest): Promise<NextResponse> => {
		const auth = await authenticateRequest(request);

		if (!auth) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Check role
		if (!allowedRoles.includes(auth.context.user.role)) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		// Call the handler
		const response = await handler(request, auth.context);

		// If we generated a new access token, set it in the response
		if (auth.newAccessToken) {
			response.cookies.set(
				ACCESS_TOKEN_COOKIE,
				auth.newAccessToken,
				accessTokenCookieOptions
			);
		}

		return response;
	};
}

/**
 * Admin-only route guard
 * Convenience wrapper for withRole(['admin'], handler)
 */
export function withAdmin(handler: RoleBasedRouteHandler) {
	return withRole(['admin'], handler);
}

/**
 * Agent-only route guard
 * Convenience wrapper for withRole(['agent'], handler)
 */
export function withAgent(handler: RoleBasedRouteHandler) {
	return withRole(['agent'], handler);
}

/**
 * Agent or Admin route guard
 */
export function withAgentOrAdmin(handler: RoleBasedRouteHandler) {
	return withRole(['agent', 'admin'], handler);
}

/**
 * Any authenticated user route guard (convenience wrapper)
 */
export function withUser(handler: ProtectedRouteHandler) {
	return withAuth(handler);
}

/**
 * Optional authentication - doesn't require auth but provides context if available
 *
 * @param handler - Route handler function
 * @returns Wrapped handler with optional authentication
 */
export function withOptionalAuth(
	handler: (
		request: NextRequest,
		context: AuthContext | null
	) => Promise<NextResponse>
) {
	return async (request: NextRequest): Promise<NextResponse> => {
		const auth = await authenticateRequest(request);

		// Call handler with or without auth context
		const response = await handler(request, auth?.context || null);

		// If we generated a new access token, set it in the response
		if (auth?.newAccessToken) {
			response.cookies.set(
				ACCESS_TOKEN_COOKIE,
				auth.newAccessToken,
				accessTokenCookieOptions
			);
		}

		return response;
	};
}

