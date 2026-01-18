/**
 * OpenAPI Schemas for Reviews API
 *
 * Derived from Zod validation schemas
 */

export const reviewSchemas = {
	// Main schemas
	Review: {
		type: 'object',
		properties: {
			id: { type: 'string', description: 'Unique review identifier' },
			userId: {
				type: 'string',
				description: 'ID of the user who wrote the review'
			},
			userName: { type: 'string', description: 'Name of the reviewer' },
			userAvatar: {
				type: 'string',
				format: 'uri',
				description: 'Avatar URL of the reviewer'
			},
			listingId: { type: 'string', description: 'ID of the reviewed listing' },
			rating: {
				type: 'integer',
				minimum: 1,
				maximum: 5,
				description: 'Star rating (1-5)'
			},
			comment: {
				type: 'string',
				minLength: 10,
				maxLength: 500,
				description: 'Review comment text'
			},
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' }
		},
		required: [
			'id',
			'userId',
			'userName',
			'listingId',
			'rating',
			'comment',
			'createdAt',
			'updatedAt'
		]
	},

	CreateReviewInput: {
		type: 'object',
		properties: {
			rating: {
				type: 'integer',
				minimum: 1,
				maximum: 5,
				description: 'Star rating (1-5)'
			},
			comment: {
				type: 'string',
				minLength: 10,
				maxLength: 500,
				description: 'Review comment text'
			}
		},
		required: ['rating', 'comment'],
		example: {
			rating: 4,
			comment:
				'Great location and the agent was very responsive. The apartment was exactly as described.'
		}
	},

	UpdateReviewInput: {
		type: 'object',
		properties: {
			rating: {
				type: 'integer',
				minimum: 1,
				maximum: 5,
				description: 'Star rating (1-5)'
			},
			comment: {
				type: 'string',
				minLength: 10,
				maxLength: 500,
				description: 'Review comment text'
			}
		},
		description: 'At least one field must be provided'
	},

	ReviewsResponse: {
		type: 'object',
		properties: {
			reviews: {
				type: 'array',
				items: { $ref: '#/components/schemas/Review' }
			},
			averageRating: {
				type: 'number',
				minimum: 0,
				maximum: 5,
				description: 'Average rating for the listing'
			},
			totalReviews: {
				type: 'integer',
				minimum: 0,
				description: 'Total number of reviews'
			},
			userReview: {
				oneOf: [{ $ref: '#/components/schemas/Review' }, { type: 'null' }],
				description:
					"Current user's review if they have reviewed (null otherwise)"
			},
			canReview: {
				type: 'boolean',
				description: 'Whether the current user can submit a review'
			},
			hasReviewed: {
				type: 'boolean',
				description: 'Whether the current user has already reviewed'
			}
		},
		required: [
			'reviews',
			'averageRating',
			'totalReviews',
			'canReview',
			'hasReviewed'
		]
	}
};

export const reviewPaths = {
	'/api/listings/{id}/reviews': {
		get: {
			tags: ['Reviews'],
			summary: 'Get reviews for a listing',
			description:
				'Fetch all reviews for a listing. If authenticated, also returns user review status.',
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Listing ID'
				}
			],
			responses: {
				'200': {
					description: 'Reviews retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/ReviewsResponse' }
								}
							}
						}
					}
				},
				'404': { description: 'Listing not found' }
			}
		},
		post: {
			tags: ['Reviews'],
			summary: 'Create a review',
			description:
				'Submit a review for a listing. User must be authenticated and have unlocked the listing. One review per user per listing.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Listing ID'
				}
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/CreateReviewInput' }
					}
				}
			},
			responses: {
				'201': {
					description: 'Review created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											review: { $ref: '#/components/schemas/Review' }
										}
									}
								}
							}
						}
					}
				},
				'400': { description: 'Validation error' },
				'401': { description: 'Not authenticated' },
				'404': { description: 'Listing not found' },
				'409': {
					description: 'User has not unlocked listing or already reviewed'
				}
			}
		}
	},
	'/api/listings/{id}/reviews/{reviewId}': {
		patch: {
			tags: ['Reviews'],
			summary: 'Update a review',
			description:
				'Update your own review. At least one field (rating or comment) must be provided.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Listing ID'
				},
				{
					name: 'reviewId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Review ID'
				}
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateReviewInput' }
					}
				}
			},
			responses: {
				'200': {
					description: 'Review updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											review: { $ref: '#/components/schemas/Review' }
										}
									}
								}
							}
						}
					}
				},
				'400': { description: 'Validation error' },
				'401': { description: 'Not authenticated' },
				'403': { description: 'Not authorized to update this review' },
				'404': { description: 'Review not found' }
			}
		},
		delete: {
			tags: ['Reviews'],
			summary: 'Delete a review',
			description: 'Delete your own review. This is a soft delete.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Listing ID'
				},
				{
					name: 'reviewId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Review ID'
				}
			],
			responses: {
				'200': {
					description: 'Review deleted successfully',
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
												example: 'Review deleted successfully'
											}
										}
									}
								}
							}
						}
					}
				},
				'401': { description: 'Not authenticated' },
				'403': { description: 'Not authorized to delete this review' },
				'404': { description: 'Review not found' }
			}
		}
	}
};
