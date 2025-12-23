import { listingSchemas, listingPaths } from './schemas/listings';

/**
 * OpenAPI Specification Builder
 *
 * Aggregates all API schemas and paths into a complete OpenAPI spec
 */

export const openApiSpec = {
	openapi: '3.0.3',
	info: {
		title: 'FUPRE Student Housing Platform API',
		description: `
API documentation for the FUPRE Student Housing Platform.

## Authentication

This API uses JWT tokens stored in HttpOnly cookies for authentication.
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

To authenticate:
1. Call \`POST /api/auth/login\` with email and password
2. Cookies are automatically set in the response
3. Include cookies in subsequent requests

## Roles

- **student**: Can browse listings, unlock locations, find roommates
- **agent**: Can create/manage listings, view earnings
- **owner**: Can browse listings and create roommate listings
- **admin**: Full platform access, approve payments, manage users

## Rate Limiting

Rate limiting is not enforced in MVP but may be added in future versions.
		`.trim(),
		version: '1.0.0',
		contact: {
			name: 'FUPRE Housing Support',
			email: 'info@easyvilleestates.com'
		}
	},
	servers: [
		{
			url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
			description: 'Current environment'
		}
	],
	tags: [
		{
			name: 'Auth',
			description: 'Authentication endpoints'
		},
		{
			name: 'Listings',
			description: 'Property listing management'
		},
		{
			name: 'Payments',
			description: 'Payment proof and unlock management'
		},
		{
			name: 'Roommates',
			description: 'Roommate listing management'
		},
		{
			name: 'Agent',
			description: 'Agent dashboard and metrics'
		},
		{
			name: 'Admin',
			description: 'Admin operations and approvals'
		}
	],
	components: {
		schemas: {
			// Common schemas
			ErrorResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: false },
					error: { type: 'string', description: 'Error message' },
					errors: {
						type: 'object',
						additionalProperties: {
							type: 'array',
							items: { type: 'string' }
						},
						description: 'Validation errors by field'
					}
				},
				required: ['success']
			},

			SuccessResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					data: { type: 'object' }
				},
				required: ['success']
			},

			// Listing schemas
			...listingSchemas
		},
		securitySchemes: {
			cookieAuth: {
				type: 'apiKey',
				in: 'cookie',
				name: 'access_token',
				description: 'JWT access token stored in HttpOnly cookie'
			}
		}
	},
	paths: {
		// Auth paths (documented but not implemented in Phase 6A)
		'/api/auth/register': {
			post: {
				tags: ['Auth'],
				summary: 'Register a new user',
				description: 'Create a new user account',
				operationId: 'register',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: { type: 'string', format: 'email' },
									password: { type: 'string', minLength: 6 },
									name: { type: 'string', minLength: 2, maxLength: 50 },
									phone: { type: 'string', pattern: '^\\+234\\d{10}$' },
									role: { type: 'string', enum: ['student', 'agent', 'owner'] },
									matricNumber: { type: 'string' }
								},
								required: ['email', 'password', 'name', 'role']
							}
						}
					}
				},
				responses: {
					'201': { description: 'User registered successfully' },
					'400': { description: 'Validation error' },
					'409': { description: 'Email already exists' }
				}
			}
		},
		'/api/auth/login': {
			post: {
				tags: ['Auth'],
				summary: 'Login',
				description: 'Authenticate and receive session cookies',
				operationId: 'login',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: { type: 'string', format: 'email' },
									password: { type: 'string' }
								},
								required: ['email', 'password']
							}
						}
					}
				},
				responses: {
					'200': { description: 'Login successful, cookies set' },
					'401': { description: 'Invalid credentials' }
				}
			}
		},
		'/api/auth/logout': {
			post: {
				tags: ['Auth'],
				summary: 'Logout',
				description: 'Clear session cookies',
				operationId: 'logout',
				responses: {
					'200': { description: 'Logged out successfully' }
				}
			}
		},
		'/api/auth/me': {
			get: {
				tags: ['Auth'],
				summary: 'Get current user',
				description: 'Get authenticated user profile',
				operationId: 'getCurrentUser',
				security: [{ cookieAuth: [] }],
				responses: {
					'200': { description: 'User profile' },
					'401': { description: 'Not authenticated' }
				}
			}
		},

		// Listing paths
		...listingPaths
	}
};

/**
 * Get OpenAPI spec as JSON string
 */
export function getOpenApiSpecJson(): string {
	return JSON.stringify(openApiSpec, null, 2);
}

