import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Next.js Middleware
 *
 * Runs on Edge Runtime for all matched routes
 * Handles authentication and route protection
 */

// Token cookie names
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Routes that require authentication
const protectedRoutes = [
	'/profile',
	'/dashboard',
	'/unlock'
];

// Routes only accessible to specific roles
const roleRestrictedRoutes: Record<string, string[]> = {
	'/dashboard/admin': ['admin'],
	'/dashboard/agent': ['agent', 'admin']
};

// Routes that should redirect authenticated users (e.g., login page)
const authRedirectRoutes = [
	'/auth/login',
	'/auth/register'
];

/**
 * Get JWT secret as Uint8Array
 */
function getSecretKey(): Uint8Array {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET not set');
	}
	return new TextEncoder().encode(secret);
}

/**
 * Verify token and extract payload
 */
async function verifyToken(token: string): Promise<{
	userId: string;
	email: string;
	role: string;
	type: string;
} | null> {
	try {
		const { payload } = await jwtVerify(token, getSecretKey());
		return {
			userId: payload.userId as string,
			email: payload.email as string,
			role: payload.role as string,
			type: payload.type as string
		};
	} catch {
		return null;
	}
}

/**
 * Check if user is authenticated
 */
async function getAuthenticatedUser(request: NextRequest): Promise<{
	userId: string;
	email: string;
	role: string;
} | null> {
	const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
	const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

	// Try access token first
	if (accessToken) {
		const payload = await verifyToken(accessToken);
		if (payload && payload.type === 'access') {
			return {
				userId: payload.userId,
				email: payload.email,
				role: payload.role
			};
		}
	}

	// Try refresh token (user will get new access token from API)
	if (refreshToken) {
		const payload = await verifyToken(refreshToken);
		if (payload && payload.type === 'refresh') {
			return {
				userId: payload.userId,
				email: payload.email,
				role: payload.role
			};
		}
	}

	return null;
}

/**
 * Check if path matches any protected routes
 */
function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);
}

/**
 * Check if path requires specific role
 */
function getRequiredRoles(pathname: string): string[] | null {
	for (const [route, roles] of Object.entries(roleRestrictedRoutes)) {
		if (pathname === route || pathname.startsWith(`${route}/`)) {
			return roles;
		}
	}
	return null;
}

/**
 * Check if path is an auth redirect route
 */
function isAuthRedirectRoute(pathname: string): boolean {
	return authRedirectRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);
}

/**
 * Middleware handler
 */
export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip middleware for static files, API routes, and Next.js internals
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname.includes('.') // Static files
	) {
		return NextResponse.next();
	}

	// Get authenticated user
	const user = await getAuthenticatedUser(request);

	// Handle auth redirect routes (login, register)
	if (isAuthRedirectRoute(pathname)) {
		if (user) {
			// Redirect authenticated users away from auth pages
			const redirectUrl = new URL('/', request.url);

			// Redirect to role-specific dashboard
			if (user.role === 'admin') {
				redirectUrl.pathname = '/dashboard/admin';
			} else if (user.role === 'agent') {
				redirectUrl.pathname = '/dashboard/agent';
			}

			return NextResponse.redirect(redirectUrl);
		}
		return NextResponse.next();
	}

	// Handle protected routes
	if (isProtectedRoute(pathname)) {
		if (!user) {
			// Redirect to login with return URL
			const loginUrl = new URL('/auth/login', request.url);
			loginUrl.searchParams.set('returnUrl', pathname);
			return NextResponse.redirect(loginUrl);
		}

		// Check role restrictions
		const requiredRoles = getRequiredRoles(pathname);
		if (requiredRoles && !requiredRoles.includes(user.role)) {
			// User doesn't have required role - redirect to home
			const homeUrl = new URL('/', request.url);
			return NextResponse.redirect(homeUrl);
		}
	}

	// Add user info to request headers for server components
	const response = NextResponse.next();

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	if (user) {
		// Add user info to request headers (accessible in server components)
		response.headers.set('x-user-id', user.userId);
		response.headers.set('x-user-email', user.email);
		response.headers.set('x-user-role', user.role);
	}

	return response;
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'
	]
};

