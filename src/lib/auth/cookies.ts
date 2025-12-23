import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Cookie Configuration & Utilities
 *
 * Implements secure HttpOnly cookies for JWT storage
 */

// Cookie names
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Cookie options
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Base cookie options for security
 */
const baseCookieOptions = {
	httpOnly: true, // Prevents JavaScript access (XSS protection)
	secure: isProduction, // HTTPS only in production
	sameSite: 'lax' as const, // CSRF protection
	path: '/' // Available across entire site
};

/**
 * Access token cookie options (short-lived)
 */
export const accessTokenCookieOptions = {
	...baseCookieOptions,
	maxAge: 15 * 60 // 15 minutes in seconds
};

/**
 * Refresh token cookie options (long-lived)
 */
export const refreshTokenCookieOptions = {
	...baseCookieOptions,
	maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
};

/**
 * Set authentication cookies in a response
 *
 * @param response - NextResponse to add cookies to
 * @param accessToken - Access token to set
 * @param refreshToken - Refresh token to set
 * @returns Response with cookies set
 */
export function setAuthCookies(
	response: NextResponse,
	accessToken: string,
	refreshToken: string
): NextResponse {
	response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);
	response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
	return response;
}

/**
 * Clear authentication cookies from a response
 *
 * @param response - NextResponse to clear cookies from
 * @returns Response with cookies cleared
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
	response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
		...baseCookieOptions,
		maxAge: 0
	});
	response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
		...baseCookieOptions,
		maxAge: 0
	});
	return response;
}

/**
 * Get access token from request cookies
 *
 * @param request - NextRequest to get cookie from
 * @returns Access token or null
 */
export function getAccessTokenFromRequest(request: NextRequest): string | null {
	return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

/**
 * Get refresh token from request cookies
 *
 * @param request - NextRequest to get cookie from
 * @returns Refresh token or null
 */
export function getRefreshTokenFromRequest(request: NextRequest): string | null {
	return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

/**
 * Get access token from server-side cookies (Route Handlers/Server Components)
 *
 * @returns Access token or null
 */
export async function getAccessToken(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

/**
 * Get refresh token from server-side cookies
 *
 * @returns Refresh token or null
 */
export async function getRefreshToken(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

