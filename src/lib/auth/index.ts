/**
 * Auth Module Index
 *
 * Re-exports all auth utilities for convenient imports
 */

// JWT utilities
export {
	createAccessToken,
	createRefreshToken,
	createTokenPair,
	verifyToken,
	verifyAccessToken,
	verifyRefreshToken,
	decodeTokenUnsafe,
	ACCESS_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_EXPIRES_IN
} from './jwt';
export type { TokenPayload } from './jwt';

// Cookie utilities
export {
	setAuthCookies,
	clearAuthCookies,
	getAccessTokenFromRequest,
	getRefreshTokenFromRequest,
	getAccessToken,
	getRefreshToken,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE
} from './cookies';

// Session management
export {
	getSession,
	toSessionUser,
	hasRequiredRole,
	isAuthenticated,
	requireAuth,
	requireRole
} from './session';
export type { SessionUser, SessionResponse } from './session';

// Route guards
export {
	authenticateRequest,
	withAuth,
	withRole,
	withAdmin,
	withAgent,
	withAgentOrAdmin,
	withUser,
	withOptionalAuth
} from './guards';
export type {
	AuthContext,
	ProtectedRouteHandler,
	RoleBasedRouteHandler
} from './guards';

