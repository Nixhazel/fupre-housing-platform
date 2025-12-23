import { verifyAccessToken, verifyRefreshToken, createTokenPair, type TokenPayload } from './jwt';
import { getAccessToken, getRefreshToken } from './cookies';
import connectDB from '@/lib/db/connect';
import User, { type IUser } from '@/lib/db/models/User';

/**
 * Session Management
 *
 * Handles session validation, user retrieval, and token refresh
 */

/**
 * Session User type (safe user data without sensitive fields)
 */
export interface SessionUser {
	id: string;
	email: string;
	name: string;
	role: 'student' | 'agent' | 'owner' | 'admin';
	phone?: string;
	avatarUrl?: string;
	matricNumber?: string;
	isEmailVerified: boolean;
	isVerified: boolean;
	savedListingIds: string[];
	unlockedListingIds: string[];
	createdAt: Date;
}

/**
 * Session response type
 */
export interface SessionResponse {
	user: SessionUser | null;
	accessToken: string | null;
	refreshToken: string | null;
	needsRefresh: boolean;
}

/**
 * Convert Mongoose user document to safe session user
 *
 * @param user - Mongoose user document
 * @returns Safe session user object
 */
export function toSessionUser(user: IUser): SessionUser {
	return {
		id: user._id.toString(),
		email: user.email,
		name: user.name,
		role: user.role,
		phone: user.phone,
		avatarUrl: user.avatarUrl,
		matricNumber: user.matricNumber,
		isEmailVerified: user.isEmailVerified,
		isVerified: user.isVerified,
		savedListingIds: user.savedListingIds.map((id) => id.toString()),
		unlockedListingIds: user.unlockedListingIds.map((id) => id.toString()),
		createdAt: user.createdAt
	};
}

/**
 * Get current session from cookies
 *
 * Attempts to validate access token first, falls back to refresh token
 *
 * @returns Session response with user data and token refresh info
 */
export async function getSession(): Promise<SessionResponse> {
	const accessToken = await getAccessToken();
	const refreshToken = await getRefreshToken();

	// No tokens at all - no session
	if (!accessToken && !refreshToken) {
		return {
			user: null,
			accessToken: null,
			refreshToken: null,
			needsRefresh: false
		};
	}

	// Try access token first
	if (accessToken) {
		try {
			const payload = await verifyAccessToken(accessToken);
			const user = await getUserFromPayload(payload);

			if (user) {
				return {
					user: toSessionUser(user),
					accessToken,
					refreshToken,
					needsRefresh: false
				};
			}
		} catch {
			// Access token invalid/expired, try refresh
		}
	}

	// Try refresh token
	if (refreshToken) {
		try {
			const payload = await verifyRefreshToken(refreshToken);
			const user = await getUserFromPayload(payload);

			if (user) {
				// Generate new tokens
				const tokens = await createTokenPair({
					userId: user._id.toString(),
					email: user.email,
					role: user.role
				});

				return {
					user: toSessionUser(user),
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					needsRefresh: true // Caller should set new cookies
				};
			}
		} catch {
			// Refresh token also invalid
		}
	}

	// All tokens invalid
	return {
		user: null,
		accessToken: null,
		refreshToken: null,
		needsRefresh: false
	};
}

/**
 * Get user from token payload
 *
 * @param payload - Token payload with userId
 * @returns User document or null
 */
async function getUserFromPayload(payload: TokenPayload): Promise<IUser | null> {
	await connectDB();

	const user = await User.findActiveById(payload.userId);

	// Verify user still exists and matches token data
	if (!user || user.email !== payload.email || user.role !== payload.role) {
		return null;
	}

	return user;
}

/**
 * Validate that a user has required role(s)
 *
 * @param userRole - User's current role
 * @param allowedRoles - Array of allowed roles
 * @returns True if user has one of the allowed roles
 */
export function hasRequiredRole(
	userRole: string,
	allowedRoles: ('student' | 'agent' | 'owner' | 'admin')[]
): boolean {
	return allowedRoles.includes(userRole as 'student' | 'agent' | 'owner' | 'admin');
}

/**
 * Check if user is authenticated (has valid session)
 *
 * @returns True if user has valid session
 */
export async function isAuthenticated(): Promise<boolean> {
	const session = await getSession();
	return session.user !== null;
}

/**
 * Require authentication - throws if not authenticated
 *
 * @returns Session user
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
	const session = await getSession();

	if (!session.user) {
		throw new Error('Authentication required');
	}

	return session.user;
}

/**
 * Require specific role(s) - throws if not authorized
 *
 * @param allowedRoles - Array of allowed roles
 * @returns Session user
 * @throws Error if not authenticated or not authorized
 */
export async function requireRole(
	allowedRoles: ('student' | 'agent' | 'owner' | 'admin')[]
): Promise<SessionUser> {
	const user = await requireAuth();

	if (!hasRequiredRole(user.role, allowedRoles)) {
		throw new Error('Insufficient permissions');
	}

	return user;
}

