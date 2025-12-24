/**
 * OpenAPI Schemas for Agent API
 */

export const agentSchemas = {
	AgentStats: {
		type: 'object',
		properties: {
			totalListings: { type: 'integer', description: 'Total number of listings' },
			activeListings: { type: 'integer', description: 'Active (available) listings' },
			totalViews: { type: 'integer', description: 'Total views across all listings' },
			totalUnlocks: { type: 'integer', description: 'Total unlocks (approved proofs)' },
			totalEarnings: { type: 'number', description: 'Total earnings in Naira' }
		}
	},
	MonthlyEarning: {
		type: 'object',
		properties: {
			month: { type: 'string', description: 'Month label (e.g., "Jan 2025")' },
			unlocks: { type: 'integer', description: 'Number of unlocks' },
			amount: { type: 'number', description: 'Earnings in Naira' }
		}
	},
	AgentListingWithStats: {
		type: 'object',
		properties: {
			_id: { type: 'string' },
			title: { type: 'string' },
			status: { type: 'string', enum: ['available', 'taken'] },
			views: { type: 'integer' },
			unlockCount: { type: 'integer', description: 'Number of unlocks for this listing' },
			earnings: { type: 'number', description: 'Earnings from this listing' },
			createdAt: { type: 'string', format: 'date-time' }
		}
	}
};

export const agentPaths = {
	'/api/agents/me/stats': {
		get: {
			tags: ['Agent'],
			summary: 'Get agent stats',
			description: 'Get dashboard statistics for the current agent.',
			security: [{ cookieAuth: [] }],
			responses: {
				'200': {
					description: 'Agent stats',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/AgentStats' }
								}
							}
						}
					}
				},
				'401': { description: 'Not authenticated' },
				'403': { description: 'Agent role required' }
			}
		}
	},
	'/api/agents/me/earnings': {
		get: {
			tags: ['Agent'],
			summary: 'Get agent earnings',
			description: 'Get monthly earnings history for the current agent.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{
					name: 'months',
					in: 'query',
					schema: { type: 'integer', default: 6, minimum: 1, maximum: 12 },
					description: 'Number of months to include'
				}
			],
			responses: {
				'200': {
					description: 'Earnings history',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											earnings: {
												type: 'array',
												items: { $ref: '#/components/schemas/MonthlyEarning' }
											}
										}
									}
								}
							}
						}
					}
				},
				'401': { description: 'Not authenticated' },
				'403': { description: 'Agent role required' }
			}
		}
	},
	'/api/agents/me/listings': {
		get: {
			tags: ['Agent'],
			summary: 'Get agent listings with stats',
			description: 'Get current agent\'s listings with unlock counts and earnings.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } },
				{ name: 'status', in: 'query', schema: { type: 'string', enum: ['available', 'taken'] } }
			],
			responses: {
				'200': {
					description: 'Agent listings with stats',
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
												items: { $ref: '#/components/schemas/AgentListingWithStats' }
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
				'403': { description: 'Agent role required' }
			}
		}
	}
};

