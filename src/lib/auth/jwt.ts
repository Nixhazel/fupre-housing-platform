import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

/**
 * JWT Token Utilities
 *
 * Uses 'jose' library for Edge Runtime compatibility (works in Vercel Edge Functions)
 * Unlike jsonwebtoken, jose works in both Node.js and Edge runtimes
 *
 * Security:
 * - Short-lived access tokens (15 minutes)
 * - Long-lived refresh tokens (7 days)
 * - HS256 algorithm for signing
 */

// Token expiration times
export const ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
export const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

/**
 * JWT Payload Interface
 */
export interface TokenPayload extends JWTPayload {
	userId: string;
	email: string;
	role: 'student' | 'agent' | 'owner' | 'admin';
	type: 'access' | 'refresh';
}

// Cache the encoded secret key
let _secretKey: Uint8Array | null = null;

/**
 * Get the secret key as Uint8Array for jose
 * Cached for performance
 */
function getSecretKey(): Uint8Array {
	if (_secretKey) return _secretKey;

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET environment variable is not set');
	}

	_secretKey = new TextEncoder().encode(secret);
	return _secretKey;
}

/**
 * Create an access token
 *
 * @param payload - User data to include in token
 * @returns Signed JWT access token
 */
export async function createAccessToken(payload: {
	userId: string;
	email: string;
	role: 'student' | 'agent' | 'owner' | 'admin';
}): Promise<string> {
	const token = await new SignJWT({
		userId: payload.userId,
		email: payload.email,
		role: payload.role,
		type: 'access'
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
		.setSubject(payload.userId)
		.sign(getSecretKey());

	return token;
}

/**
 * Create a refresh token
 *
 * @param payload - User data to include in token
 * @returns Signed JWT refresh token
 */
export async function createRefreshToken(payload: {
	userId: string;
	email: string;
	role: 'student' | 'agent' | 'owner' | 'admin';
}): Promise<string> {
	const token = await new SignJWT({
		userId: payload.userId,
		email: payload.email,
		role: payload.role,
		type: 'refresh'
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
		.setSubject(payload.userId)
		.sign(getSecretKey());

	return token;
}

/**
 * Create both access and refresh tokens
 *
 * @param payload - User data to include in tokens
 * @returns Object containing both tokens
 */
export async function createTokenPair(payload: {
	userId: string;
	email: string;
	role: 'student' | 'agent' | 'owner' | 'admin';
}): Promise<{ accessToken: string; refreshToken: string }> {
	const [accessToken, refreshToken] = await Promise.all([
		createAccessToken(payload),
		createRefreshToken(payload)
	]);

	return { accessToken, refreshToken };
}

/**
 * Verify and decode a JWT token
 *
 * @param token - JWT token to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
	try {
		const { payload } = await jwtVerify(token, getSecretKey());
		return payload as TokenPayload;
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('expired')) {
				throw new Error('Token has expired');
			}
			if (error.message.includes('signature')) {
				throw new Error('Invalid token signature');
			}
		}
		throw new Error('Invalid token');
	}
}

/**
 * Verify an access token specifically
 *
 * @param token - JWT token to verify
 * @returns Decoded payload if valid access token
 * @throws Error if not a valid access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
	const payload = await verifyToken(token);

	if (payload.type !== 'access') {
		throw new Error('Invalid token type: expected access token');
	}

	return payload;
}

/**
 * Verify a refresh token specifically
 *
 * @param token - JWT token to verify
 * @returns Decoded payload if valid refresh token
 * @throws Error if not a valid refresh token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
	const payload = await verifyToken(token);

	if (payload.type !== 'refresh') {
		throw new Error('Invalid token type: expected refresh token');
	}

	return payload;
}

/**
 * Decode a token without verification (for debugging/inspection)
 * WARNING: This does NOT verify the token signature!
 *
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid format
 */
export function decodeTokenUnsafe(token: string): TokenPayload | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const payload = JSON.parse(
			Buffer.from(parts[1], 'base64url').toString('utf-8')
		);
		return payload as TokenPayload;
	} catch {
		return null;
	}
}
