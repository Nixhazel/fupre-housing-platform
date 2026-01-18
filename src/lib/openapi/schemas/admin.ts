/**
 * OpenAPI Schemas for Admin API
 */

export const adminSchemas = {
	PlatformStats: {
		type: 'object',
		properties: {
			totalUsers: { type: 'integer', description: 'Total registered users' },
			usersByRole: {
				type: 'object',
				properties: {
					student: { type: 'integer' },
					agent: { type: 'integer' },
					owner: { type: 'integer' },
					admin: { type: 'integer' }
				}
			},
			totalListings: { type: 'integer', description: 'Total property listings' },
			activeListings: { type: 'integer', description: 'Available listings' },
			totalRoommates: { type: 'integer', description: 'Total roommate listings' },
			pendingProofs: { type: 'integer', description: 'Pending payment proofs' },
			approvedProofs: { type: 'integer', description: 'Approved payment proofs' },
			rejectedProofs: { type: 'integer', description: 'Rejected payment proofs' },
			totalRevenue: { type: 'number', description: 'Total platform revenue (Naira)' }
		}
	},
	AdminUser: {
		type: 'object',
		properties: {
			_id: { type: 'string' },
			email: { type: 'string' },
			name: { type: 'string' },
			role: { type: 'string', enum: ['student', 'agent', 'owner', 'admin'] },
			phone: { type: 'string' },
			isEmailVerified: { type: 'boolean' },
			isVerified: { type: 'boolean' },
			createdAt: { type: 'string', format: 'date-time' }
		}
	},
	UpdateUserRequest: {
		type: 'object',
		properties: {
			isVerified: { type: 'boolean', description: 'Verify/unverify user' },
			role: {
				type: 'string',
				enum: ['student', 'agent', 'owner'],
				description: 'Change user role (cannot set to admin)'
			}
		}
	}
};

export const adminPaths = {
	'/api/admin/stats': {
		get: {
			tags: ['Admin'],
			summary: 'Get platform stats',
			description: 'Get platform-wide statistics. Admin only.',
			security: [{ cookieAuth: [] }],
			responses: {
				'200': {
					description: 'Platform statistics',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/PlatformStats' }
								}
							}
						}
					}
				},
				'401': { description: 'Not authenticated' },
				'403': { description: 'Admin access required' }
			}
		}
	},
	'/api/admin/users': {
		get: {
			tags: ['Admin'],
			summary: 'List users',
			description: 'Get paginated list of users. Admin only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
				{ name: 'role', in: 'query', schema: { type: 'string', enum: ['student', 'agent', 'owner', 'admin'] } },
				{ name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or email' },
				{ name: 'verified', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } }
			],
			responses: {
				'200': {
					description: 'List of users',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											users: {
												type: 'array',
												items: { $ref: '#/components/schemas/AdminUser' }
											},
											pagination: { $ref: '#/components/schemas/PaginationMeta' }
										}
									}
								}
							}
						}
					}
				},
				'401': { description: 'Not authenticated' },
				'403': { description: 'Admin access required' }
			}
		}
	},
	'/api/admin/users/{id}': {
		get: {
			tags: ['Admin'],
			summary: 'Get user by ID',
			description: 'Get details of a specific user. Admin only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			responses: {
				'200': { description: 'User details' },
				'404': { description: 'User not found' }
			}
		},
		patch: {
			tags: ['Admin'],
			summary: 'Update user',
			description: 'Update user verification or role. Admin only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateUserRequest' }
					}
				}
			},
			responses: {
				'200': { description: 'User updated' },
				'400': { description: 'Validation error' },
				'404': { description: 'User not found' }
			}
		},
		delete: {
			tags: ['Admin'],
			summary: 'Delete user',
			description: 'Soft delete a user. Cannot delete admins or self. Admin only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			responses: {
				'200': { description: 'User deleted' },
				'403': { description: 'Cannot delete this user' },
				'404': { description: 'User not found' }
			}
		}
	}
};

