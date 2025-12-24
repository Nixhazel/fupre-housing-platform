/**
 * OpenAPI Schemas for Roommates API
 */

export const roommateSchemas = {
	RoommateListing: {
		type: 'object',
		properties: {
			_id: { type: 'string', description: 'Unique identifier' },
			ownerId: { type: 'string', description: 'Owner user ID' },
			ownerType: {
				type: 'string',
				enum: ['student', 'owner'],
				description: 'Type of owner'
			},
			title: { type: 'string', description: 'Listing title' },
			budgetMonthly: { type: 'number', description: 'Monthly budget in Naira' },
			moveInDate: { type: 'string', format: 'date', description: 'Preferred move-in date' },
			description: { type: 'string', description: 'Listing description' },
			photos: {
				type: 'array',
				items: { type: 'string' },
				description: 'Photo URLs'
			},
			preferences: {
				type: 'object',
				properties: {
					gender: { type: 'string', enum: ['male', 'female', 'any'] },
					cleanliness: { type: 'string', enum: ['low', 'medium', 'high'] },
					studyHours: { type: 'string', enum: ['morning', 'evening', 'night', 'flexible'] },
					smoking: { type: 'string', enum: ['no', 'yes', 'outdoor_only'] },
					pets: { type: 'string', enum: ['no', 'yes'] }
				}
			},
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' }
		}
	},
	CreateRoommateListingRequest: {
		type: 'object',
		required: ['title', 'budgetMonthly', 'moveInDate', 'description', 'photos'],
		properties: {
			title: { type: 'string', minLength: 5, maxLength: 100 },
			budgetMonthly: { type: 'number', minimum: 10000, maximum: 100000 },
			moveInDate: { type: 'string', format: 'date' },
			description: { type: 'string', minLength: 20, maxLength: 500 },
			photos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				minItems: 1,
				maxItems: 5
			},
			preferences: {
				type: 'object',
				properties: {
					gender: { type: 'string', enum: ['male', 'female', 'any'] },
					cleanliness: { type: 'string', enum: ['low', 'medium', 'high'] },
					studyHours: { type: 'string', enum: ['morning', 'evening', 'night', 'flexible'] },
					smoking: { type: 'string', enum: ['no', 'yes', 'outdoor_only'] },
					pets: { type: 'string', enum: ['no', 'yes'] }
				}
			}
		}
	},
	UpdateRoommateListingRequest: {
		type: 'object',
		properties: {
			title: { type: 'string', minLength: 5, maxLength: 100 },
			budgetMonthly: { type: 'number', minimum: 10000, maximum: 100000 },
			moveInDate: { type: 'string', format: 'date' },
			description: { type: 'string', minLength: 20, maxLength: 500 },
			photos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				minItems: 1,
				maxItems: 5
			},
			preferences: { type: 'object' }
		}
	}
};

export const roommatePaths = {
	'/api/roommates': {
		get: {
			tags: ['Roommates'],
			summary: 'List roommate listings',
			description: 'Get paginated roommate listings with optional filters.',
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 50 } },
				{ name: 'search', in: 'query', schema: { type: 'string' } },
				{ name: 'minBudget', in: 'query', schema: { type: 'number' } },
				{ name: 'maxBudget', in: 'query', schema: { type: 'number' } },
				{ name: 'gender', in: 'query', schema: { type: 'string', enum: ['male', 'female', 'any'] } },
				{ name: 'cleanliness', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } },
				{ name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'budget_low', 'budget_high'] } }
			],
			responses: {
				'200': {
					description: 'List of roommate listings',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											listings: {
												type: 'array',
												items: { $ref: '#/components/schemas/RoommateListing' }
											},
											pagination: { $ref: '#/components/schemas/PaginationMeta' }
										}
									}
								}
							}
						}
					}
				}
			}
		},
		post: {
			tags: ['Roommates'],
			summary: 'Create roommate listing',
			description: 'Create a new roommate listing. Students and owners only.',
			security: [{ cookieAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/CreateRoommateListingRequest' }
					}
				}
			},
			responses: {
				'201': { description: 'Listing created successfully' },
				'400': { description: 'Validation error' },
				'401': { description: 'Not authenticated' },
				'403': { description: 'Only students and owners allowed' }
			}
		}
	},
	'/api/roommates/me': {
		get: {
			tags: ['Roommates'],
			summary: 'Get my roommate listings',
			description: 'Get current user\'s roommate listings.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
			],
			responses: {
				'200': { description: 'User\'s roommate listings' },
				'401': { description: 'Not authenticated' }
			}
		}
	},
	'/api/roommates/{id}': {
		get: {
			tags: ['Roommates'],
			summary: 'Get roommate listing by ID',
			description: 'Get details of a specific roommate listing.',
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			responses: {
				'200': { description: 'Roommate listing details' },
				'404': { description: 'Listing not found' }
			}
		},
		patch: {
			tags: ['Roommates'],
			summary: 'Update roommate listing',
			description: 'Update a roommate listing. Owner only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateRoommateListingRequest' }
					}
				}
			},
			responses: {
				'200': { description: 'Listing updated' },
				'400': { description: 'Validation error' },
				'403': { description: 'Not owner' },
				'404': { description: 'Listing not found' }
			}
		},
		delete: {
			tags: ['Roommates'],
			summary: 'Delete roommate listing',
			description: 'Soft delete a roommate listing. Owner only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			responses: {
				'200': { description: 'Listing deleted' },
				'403': { description: 'Not owner' },
				'404': { description: 'Listing not found' }
			}
		}
	}
};

