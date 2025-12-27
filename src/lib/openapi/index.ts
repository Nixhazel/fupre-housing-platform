import { listingSchemas, listingPaths } from './schemas/listings';
import { paymentProofSchemas, paymentProofPaths } from './schemas/payments';
import { roommateSchemas, roommatePaths } from './schemas/roommates';
import { reviewSchemas, reviewPaths } from './schemas/reviews';
import { agentSchemas, agentPaths } from './schemas/agents';
import { adminSchemas, adminPaths } from './schemas/admin';

/**
 * OpenAPI Specification Builder
 *
 * Aggregates all API schemas and paths into a complete OpenAPI spec
 */

export const openApiSpec = {
	openapi: '3.0.3',
	info: {
		title: 'EasyVille Estates API',
		description: `
API documentation for the EasyVille Estates Platform.

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
			name: 'EasyVille Estates Support',
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
			name: 'Reviews',
			description: 'Listing review management'
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
				required: ['success'],
				example: {
					success: false,
					error: 'Invalid request data',
					errors: {
						email: ['Email is required', 'Email must be valid']
					}
				}
			},

			SuccessResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					data: { type: 'object' }
				},
				required: ['success']
			},

			// Pagination meta
			PaginationMeta: {
				type: 'object',
				properties: {
					page: { type: 'integer', example: 1 },
					limit: { type: 'integer', example: 12 },
					total: { type: 'integer', example: 48 },
					totalPages: { type: 'integer', example: 4 }
				}
			},

			// User/Session schemas
			SessionUser: {
				type: 'object',
				properties: {
					id: { type: 'string', example: '507f1f77bcf86cd799439011' },
					email: {
						type: 'string',
						format: 'email',
						example: 'student@example.com'
					},
					name: { type: 'string', example: 'John Doe' },
					role: {
						type: 'string',
						enum: ['student', 'agent', 'owner', 'admin'],
						example: 'student'
					},
					phone: { type: 'string', example: '+2348012345678' },
					avatarUrl: {
						type: 'string',
						format: 'uri',
						example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg'
					},
					matricNumber: { type: 'string', example: 'FUP/20/0001' },
					isEmailVerified: { type: 'boolean', example: true },
					isVerified: {
						type: 'boolean',
						example: false,
						description: 'Admin-verified status'
					},
					savedListingIds: {
						type: 'array',
						items: { type: 'string' },
						example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
					},
					savedRoommateIds: {
						type: 'array',
						items: { type: 'string' },
						example: []
					},
					unlockedListingIds: {
						type: 'array',
						items: { type: 'string' },
						example: ['507f1f77bcf86cd799439015']
					},
					createdAt: {
						type: 'string',
						format: 'date-time',
						example: '2024-01-15T10:30:00.000Z'
					}
				},
				required: [
					'id',
					'email',
					'name',
					'role',
					'isEmailVerified',
					'isVerified',
					'savedListingIds',
					'savedRoommateIds',
					'unlockedListingIds',
					'createdAt'
				]
			},

			// Listing schemas
			...listingSchemas,

			// Payment schemas
			...paymentProofSchemas,

			// Roommate schemas
			...roommateSchemas,

			// Review schemas
			...reviewSchemas,

			// Agent schemas
			...agentSchemas,

			// Admin schemas
			...adminSchemas
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
		// Auth paths
		'/api/auth/register': {
			post: {
				tags: ['Auth'],
				summary: 'Register a new user',
				description:
					'Create a new user account. A verification email will be sent.',
				operationId: 'register',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: {
										type: 'string',
										format: 'email',
										example: 'student@example.com'
									},
									password: {
										type: 'string',
										minLength: 6,
										example: 'SecurePass123!'
									},
									name: {
										type: 'string',
										minLength: 2,
										maxLength: 50,
										example: 'John Doe'
									},
									phone: {
										type: 'string',
										pattern: '^\\+234\\d{10}$',
										example: '+2348012345678'
									},
									role: {
										type: 'string',
										enum: ['student', 'agent', 'owner'],
										example: 'student'
									},
									matricNumber: { type: 'string', example: 'FUP/20/0001' }
								},
								required: ['email', 'password', 'name', 'role']
							},
							example: {
								email: 'student@example.com',
								password: 'SecurePass123!',
								name: 'John Doe',
								phone: '+2348012345678',
								role: 'student',
								matricNumber: 'FUP/20/0001'
							}
						}
					}
				},
				responses: {
					'201': {
						description: 'User registered successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												user: { $ref: '#/components/schemas/SessionUser' },
												message: {
													type: 'string',
													example:
														'Verification email sent. Please check your inbox.'
												}
											}
										}
									}
								},
								example: {
									success: true,
									data: {
										user: {
											id: '507f1f77bcf86cd799439011',
											email: 'student@example.com',
											name: 'John Doe',
											role: 'student',
											phone: '+2348012345678',
											matricNumber: 'FUP/20/0001',
											isEmailVerified: false,
											isVerified: false,
											savedListingIds: [],
											savedRoommateIds: [],
											unlockedListingIds: [],
											createdAt: '2024-01-15T10:30:00.000Z'
										},
										message: 'Verification email sent. Please check your inbox.'
									}
								}
							}
						}
					},
					'400': {
						description: 'Validation error',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' },
								example: {
									success: false,
									error: 'Validation failed',
									errors: {
										email: ['Email is required'],
										password: ['Password must be at least 6 characters']
									}
								}
							}
						}
					},
					'409': {
						description: 'Email already exists',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' },
								example: {
									success: false,
									error: 'An account with this email already exists'
								}
							}
						}
					}
				}
			}
		},
		'/api/auth/login': {
			post: {
				tags: ['Auth'],
				summary: 'Login',
				description:
					'Authenticate with email and password. Sets HttpOnly session cookies.',
				operationId: 'login',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: {
										type: 'string',
										format: 'email',
										example: 'student@example.com'
									},
									password: { type: 'string', example: 'SecurePass123!' }
								},
								required: ['email', 'password']
							},
							example: {
								email: 'student@example.com',
								password: 'SecurePass123!'
							}
						}
					}
				},
				responses: {
					'200': {
						description:
							'Login successful. Session cookies are set in the response.',
						headers: {
							'Set-Cookie': {
								description: 'Session cookies (access_token, refresh_token)',
								schema: { type: 'string' }
							}
						},
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												user: { $ref: '#/components/schemas/SessionUser' }
											}
										}
									}
								},
								example: {
									success: true,
									data: {
										user: {
											id: '507f1f77bcf86cd799439011',
											email: 'student@example.com',
											name: 'John Doe',
											role: 'student',
											phone: '+2348012345678',
											matricNumber: 'FUP/20/0001',
											isEmailVerified: true,
											isVerified: false,
											savedListingIds: ['507f1f77bcf86cd799439012'],
											savedRoommateIds: [],
											unlockedListingIds: ['507f1f77bcf86cd799439015'],
											createdAt: '2024-01-15T10:30:00.000Z'
										}
									}
								}
							}
						}
					},
					'401': {
						description: 'Invalid credentials',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' },
								example: {
									success: false,
									error: 'Invalid email or password'
								}
							}
						}
					}
				}
			}
		},
		'/api/auth/logout': {
			post: {
				tags: ['Auth'],
				summary: 'Logout',
				description: 'Clear session cookies and end the current session.',
				operationId: 'logout',
				security: [{ cookieAuth: [] }],
				responses: {
					'200': {
						description: 'Logged out successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												message: {
													type: 'string',
													example: 'Logged out successfully'
												}
											}
										}
									}
								},
								example: {
									success: true,
									data: {
										message: 'Logged out successfully'
									}
								}
							}
						}
					}
				}
			}
		},
		'/api/auth/me': {
			get: {
				tags: ['Auth'],
				summary: 'Get current user',
				description: "Get the authenticated user's profile information.",
				operationId: 'getCurrentUser',
				security: [{ cookieAuth: [] }],
				responses: {
					'200': {
						description: 'User profile retrieved successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												user: { $ref: '#/components/schemas/SessionUser' }
											}
										}
									}
								},
								example: {
									success: true,
									data: {
										user: {
											id: '507f1f77bcf86cd799439011',
											email: 'student@example.com',
											name: 'John Doe',
											role: 'student',
											phone: '+2348012345678',
											avatarUrl:
												'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
											matricNumber: 'FUP/20/0001',
											isEmailVerified: true,
											isVerified: false,
											savedListingIds: [
												'507f1f77bcf86cd799439012',
												'507f1f77bcf86cd799439013'
											],
											savedRoommateIds: ['507f1f77bcf86cd799439020'],
											unlockedListingIds: ['507f1f77bcf86cd799439015'],
											createdAt: '2024-01-15T10:30:00.000Z'
										}
									}
								}
							}
						}
					},
					'401': {
						description: 'Not authenticated - no valid session',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' },
								example: {
									success: false,
									error: 'Authentication required'
								}
							}
						}
					}
				}
			},
			patch: {
				tags: ['Auth'],
				summary: 'Update current user',
				description: "Update the authenticated user's profile information.",
				operationId: 'updateCurrentUser',
				security: [{ cookieAuth: [] }],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									name: {
										type: 'string',
										minLength: 2,
										maxLength: 50,
										example: 'John Smith'
									},
									phone: { type: 'string', example: '+2348012345679' },
									avatarUrl: {
										type: 'string',
										format: 'uri',
										example:
											'https://res.cloudinary.com/demo/image/upload/new-avatar.jpg'
									},
									matricNumber: { type: 'string', example: 'FUP/20/0002' }
								}
							},
							example: {
								name: 'John Smith',
								phone: '+2348012345679'
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Profile updated successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												user: { $ref: '#/components/schemas/SessionUser' }
											}
										}
									}
								}
							}
						}
					},
					'401': {
						description: 'Not authenticated',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' }
							}
						}
					}
				}
			}
		},
		'/api/auth/refresh': {
			post: {
				tags: ['Auth'],
				summary: 'Refresh access token',
				description: 'Use refresh token to get a new access token.',
				operationId: 'refreshToken',
				responses: {
					'200': {
						description: 'Token refreshed successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												message: { type: 'string', example: 'Token refreshed' }
											}
										}
									}
								}
							}
						}
					},
					'401': {
						description: 'Invalid or expired refresh token',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' },
								example: {
									success: false,
									error: 'Invalid refresh token'
								}
							}
						}
					}
				}
			}
		},
		'/api/auth/forgot-password': {
			post: {
				tags: ['Auth'],
				summary: 'Request password reset',
				description: 'Send password reset email to user.',
				operationId: 'forgotPassword',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: {
										type: 'string',
										format: 'email',
										example: 'student@example.com'
									}
								},
								required: ['email']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Reset email sent (if account exists)',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												message: {
													type: 'string',
													example:
														'If an account exists with this email, a password reset link has been sent.'
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		},
		'/api/auth/reset-password': {
			post: {
				tags: ['Auth'],
				summary: 'Reset password',
				description: 'Reset password using token from email.',
				operationId: 'resetPassword',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									token: { type: 'string', example: 'abc123xyz...' },
									password: {
										type: 'string',
										minLength: 6,
										example: 'NewSecurePass123!'
									}
								},
								required: ['token', 'password']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Password reset successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												message: {
													type: 'string',
													example:
														'Password reset successfully. Please log in with your new password.'
												}
											}
										}
									}
								}
							}
						}
					},
					'400': {
						description: 'Invalid or expired token',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' },
								example: {
									success: false,
									error: 'Invalid or expired reset token'
								}
							}
						}
					}
				}
			}
		},
		'/api/auth/verify-email': {
			post: {
				tags: ['Auth'],
				summary: 'Verify email address',
				description: 'Verify email using token from verification email.',
				operationId: 'verifyEmail',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									token: {
										type: 'string',
										example: 'verification-token-123...'
									}
								},
								required: ['token']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Email verified successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												message: {
													type: 'string',
													example: 'Email verified successfully'
												}
											}
										}
									}
								}
							}
						}
					},
					'400': {
						description: 'Invalid or expired token',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' }
							}
						}
					}
				}
			}
		},
		'/api/auth/resend-verification': {
			post: {
				tags: ['Auth'],
				summary: 'Resend verification email',
				description: 'Resend email verification link.',
				operationId: 'resendVerification',
				security: [{ cookieAuth: [] }],
				responses: {
					'200': {
						description: 'Verification email sent',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										data: {
											type: 'object',
											properties: {
												message: {
													type: 'string',
													example: 'Verification email sent'
												}
											}
										}
									}
								}
							}
						}
					},
					'400': {
						description: 'Email already verified',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ErrorResponse' },
								example: {
									success: false,
									error: 'Email is already verified'
								}
							}
						}
					}
				}
			}
		},

		// Listing paths
		...listingPaths,

		// Payment paths
		...paymentProofPaths,

		// Roommate paths
		...roommatePaths,

		// Review paths
		...reviewPaths,

		// Agent paths
		...agentPaths,

		// Admin paths
		...adminPaths
	}
};

/**
 * Get OpenAPI spec as JSON string
 */
export function getOpenApiSpecJson(): string {
	return JSON.stringify(openApiSpec, null, 2);
}
