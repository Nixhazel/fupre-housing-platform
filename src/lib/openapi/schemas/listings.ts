/**
 * OpenAPI Schemas for Listings API
 *
 * Derived from Zod validation schemas
 */

export const listingSchemas = {
	// Enums
	CampusArea: {
		type: 'string',
		enum: ['Ugbomro', 'Effurun', 'Enerhen', 'PTI Road', 'Other'],
		description: 'Campus area where the listing is located'
	},

	ListingStatus: {
		type: 'string',
		enum: ['available', 'taken'],
		description: 'Availability status of the listing'
	},

	SortBy: {
		type: 'string',
		enum: ['newest', 'oldest', 'price_low', 'price_high', 'rating', 'views'],
		default: 'newest',
		description: 'Sort order for listings'
	},

	// Main schemas
	PublicListing: {
		type: 'object',
		properties: {
			id: { type: 'string', description: 'Unique listing identifier' },
			title: { type: 'string', minLength: 5, maxLength: 100 },
			description: { type: 'string', minLength: 20, maxLength: 1000 },
			campusArea: { $ref: '#/components/schemas/CampusArea' },
			addressApprox: {
				type: 'string',
				description: 'Approximate address (public)'
			},
			priceMonthly: {
				type: 'number',
				minimum: 5000,
				maximum: 500000,
				description: 'Monthly rent in Naira'
			},
			bedrooms: { type: 'integer', minimum: 1, maximum: 5 },
			bathrooms: { type: 'integer', minimum: 1, maximum: 4 },
			distanceToCampusKm: {
				type: 'number',
				minimum: 0.1,
				maximum: 20,
				description: 'Distance to campus in kilometers'
			},
			amenities: {
				type: 'array',
				items: { type: 'string' },
				minItems: 1,
				maxItems: 10
			},
			photos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				minItems: 1,
				maxItems: 10
			},
			coverPhoto: { type: 'string', format: 'uri' },
			mapPreview: { type: 'string', format: 'uri' },
			agentId: { type: 'string', description: 'ID of the agent who created the listing' },
			status: { $ref: '#/components/schemas/ListingStatus' },
			rating: { type: 'number', minimum: 0, maximum: 5 },
			reviewsCount: { type: 'integer', minimum: 0 },
			views: { type: 'integer', minimum: 0 },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' }
		},
		required: [
			'id',
			'title',
			'description',
			'campusArea',
			'addressApprox',
			'priceMonthly',
			'bedrooms',
			'bathrooms',
			'distanceToCampusKm',
			'amenities',
			'photos',
			'coverPhoto',
			'mapPreview',
			'agentId',
			'status',
			'rating',
			'reviewsCount',
			'views',
			'createdAt',
			'updatedAt'
		]
	},

	UnlockedListing: {
		allOf: [
			{ $ref: '#/components/schemas/PublicListing' },
			{
				type: 'object',
				properties: {
					addressFull: {
						type: 'string',
						description: 'Full address (revealed after unlock)'
					},
					mapFull: {
						type: 'string',
						format: 'uri',
						description: 'Full map image (revealed after unlock)'
					}
				},
				required: ['addressFull', 'mapFull']
			}
		]
	},

	CreateListingInput: {
		type: 'object',
		properties: {
			title: { type: 'string', minLength: 5, maxLength: 100 },
			description: { type: 'string', minLength: 20, maxLength: 1000 },
			campusArea: { $ref: '#/components/schemas/CampusArea' },
			addressApprox: { type: 'string', minLength: 5, maxLength: 200 },
			addressFull: { type: 'string', minLength: 10, maxLength: 300 },
			priceMonthly: { type: 'number', minimum: 5000, maximum: 500000 },
			bedrooms: { type: 'integer', minimum: 1, maximum: 5 },
			bathrooms: { type: 'integer', minimum: 1, maximum: 4 },
			distanceToCampusKm: { type: 'number', minimum: 0.1, maximum: 20 },
			amenities: {
				type: 'array',
				items: { type: 'string' },
				minItems: 1,
				maxItems: 10
			},
			photos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				minItems: 1,
				maxItems: 10
			},
			coverPhoto: { type: 'string', format: 'uri' },
			mapPreview: { type: 'string', format: 'uri' },
			mapFull: { type: 'string', format: 'uri' }
		},
		required: [
			'title',
			'description',
			'campusArea',
			'addressApprox',
			'addressFull',
			'priceMonthly',
			'bedrooms',
			'bathrooms',
			'distanceToCampusKm',
			'amenities',
			'photos',
			'coverPhoto',
			'mapPreview',
			'mapFull'
		]
	},

	UpdateListingInput: {
		type: 'object',
		properties: {
			title: { type: 'string', minLength: 5, maxLength: 100 },
			description: { type: 'string', minLength: 20, maxLength: 1000 },
			campusArea: { $ref: '#/components/schemas/CampusArea' },
			addressApprox: { type: 'string', minLength: 5, maxLength: 200 },
			addressFull: { type: 'string', minLength: 10, maxLength: 300 },
			priceMonthly: { type: 'number', minimum: 5000, maximum: 500000 },
			bedrooms: { type: 'integer', minimum: 1, maximum: 5 },
			bathrooms: { type: 'integer', minimum: 1, maximum: 4 },
			distanceToCampusKm: { type: 'number', minimum: 0.1, maximum: 20 },
			amenities: { type: 'array', items: { type: 'string' } },
			photos: { type: 'array', items: { type: 'string', format: 'uri' } },
			coverPhoto: { type: 'string', format: 'uri' },
			mapPreview: { type: 'string', format: 'uri' },
			mapFull: { type: 'string', format: 'uri' },
			status: { $ref: '#/components/schemas/ListingStatus' }
		}
	},

	UpdateStatusInput: {
		type: 'object',
		properties: {
			status: { $ref: '#/components/schemas/ListingStatus' }
		},
		required: ['status']
	},

	Pagination: {
		type: 'object',
		properties: {
			page: { type: 'integer', minimum: 1 },
			limit: { type: 'integer', minimum: 1, maximum: 50 },
			total: { type: 'integer', minimum: 0 },
			totalPages: { type: 'integer', minimum: 0 },
			hasNext: { type: 'boolean' },
			hasPrev: { type: 'boolean' }
		},
		required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
	},

	PaginatedListings: {
		type: 'object',
		properties: {
			listings: {
				type: 'array',
				items: { $ref: '#/components/schemas/PublicListing' }
			},
			pagination: { $ref: '#/components/schemas/Pagination' }
		},
		required: ['listings', 'pagination']
	}
};

export const listingPaths = {
	'/api/listings': {
		get: {
			tags: ['Listings'],
			summary: 'Get paginated listings',
			description:
				'Fetch listings with optional filters, search, and pagination. Public endpoint.',
			operationId: 'getListings',
			parameters: [
				{
					name: 'page',
					in: 'query',
					schema: { type: 'integer', default: 1, minimum: 1 },
					description: 'Page number'
				},
				{
					name: 'limit',
					in: 'query',
					schema: { type: 'integer', default: 12, minimum: 1, maximum: 50 },
					description: 'Items per page'
				},
				{
					name: 'search',
					in: 'query',
					schema: { type: 'string' },
					description: 'Text search query'
				},
				{
					name: 'campusArea',
					in: 'query',
					schema: { $ref: '#/components/schemas/CampusArea' },
					description: 'Filter by campus area'
				},
				{
					name: 'minPrice',
					in: 'query',
					schema: { type: 'number', minimum: 0 },
					description: 'Minimum price filter'
				},
				{
					name: 'maxPrice',
					in: 'query',
					schema: { type: 'number', maximum: 1000000 },
					description: 'Maximum price filter'
				},
				{
					name: 'bedrooms',
					in: 'query',
					schema: { type: 'integer', minimum: 1, maximum: 5 },
					description: 'Filter by bedroom count'
				},
				{
					name: 'bathrooms',
					in: 'query',
					schema: { type: 'integer', minimum: 1, maximum: 4 },
					description: 'Filter by bathroom count'
				},
				{
					name: 'status',
					in: 'query',
					schema: { $ref: '#/components/schemas/ListingStatus' },
					description: 'Filter by availability status'
				},
				{
					name: 'agentId',
					in: 'query',
					schema: { type: 'string' },
					description: 'Filter by agent ID'
				},
				{
					name: 'sortBy',
					in: 'query',
					schema: { $ref: '#/components/schemas/SortBy' },
					description: 'Sort order'
				}
			],
			responses: {
				'200': {
					description: 'Successful response',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/PaginatedListings' }
								}
							}
						}
					}
				},
				'400': {
					description: 'Validation error',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' }
						}
					}
				}
			}
		},
		post: {
			tags: ['Listings'],
			summary: 'Create a new listing',
			description: 'Create a new property listing. Requires agent role.',
			operationId: 'createListing',
			security: [{ cookieAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/CreateListingInput' },
						example: {
							title: 'Modern 2-Bedroom Apartment near FUPRE',
							description:
								'Spacious and well-furnished apartment with modern amenities, perfect for students.',
							campusArea: 'Ugbomro',
							addressApprox: 'Off Main Road, Ugbomro',
							addressFull: 'No 15, Peace Avenue, Off Main Road, Ugbomro',
							priceMonthly: 45000,
							bedrooms: 2,
							bathrooms: 1,
							distanceToCampusKm: 0.5,
							amenities: ['WiFi', 'Water', 'Security', 'Generator'],
							photos: ['https://example.com/photo1.jpg'],
							coverPhoto: 'https://example.com/cover.jpg',
							mapPreview: 'https://example.com/map-preview.jpg',
							mapFull: 'https://example.com/map-full.jpg'
						}
					}
				}
			},
			responses: {
				'201': {
					description: 'Listing created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											listing: { $ref: '#/components/schemas/PublicListing' }
										}
									}
								}
							}
						}
					}
				},
				'400': {
					description: 'Validation error',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' }
						}
					}
				},
				'401': {
					description: 'Authentication required',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' }
						}
					}
				},
				'403': {
					description: 'Agent role required',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' }
						}
					}
				}
			}
		}
	},

	'/api/listings/{id}': {
		get: {
			tags: ['Listings'],
			summary: 'Get a single listing',
			description:
				'Fetch a listing by ID. Returns private fields if user has unlocked the listing.',
			operationId: 'getListingById',
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
					description: 'Successful response',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											listing: {
												oneOf: [
													{ $ref: '#/components/schemas/PublicListing' },
													{ $ref: '#/components/schemas/UnlockedListing' }
												]
											},
											isUnlocked: { type: 'boolean' }
										}
									}
								}
							}
						}
					}
				},
				'404': {
					description: 'Listing not found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' }
						}
					}
				}
			}
		},
		patch: {
			tags: ['Listings'],
			summary: 'Update a listing',
			description: 'Update listing details. Agent only, must own the listing.',
			operationId: 'updateListing',
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
						schema: { $ref: '#/components/schemas/UpdateListingInput' }
					}
				}
			},
			responses: {
				'200': {
					description: 'Listing updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											listing: { $ref: '#/components/schemas/PublicListing' }
										}
									}
								}
							}
						}
					}
				},
				'401': { description: 'Authentication required' },
				'403': { description: 'Not authorized to update this listing' },
				'404': { description: 'Listing not found' }
			}
		},
		delete: {
			tags: ['Listings'],
			summary: 'Delete a listing',
			description: 'Soft delete a listing. Agent only, must own the listing.',
			operationId: 'deleteListing',
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
			responses: {
				'200': {
					description: 'Listing deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											message: { type: 'string' }
										}
									}
								}
							}
						}
					}
				},
				'401': { description: 'Authentication required' },
				'403': { description: 'Not authorized to delete this listing' },
				'404': { description: 'Listing not found' }
			}
		}
	},

	'/api/listings/{id}/status': {
		patch: {
			tags: ['Listings'],
			summary: 'Update listing status',
			description:
				'Mark listing as available or taken. Agent only, must own the listing.',
			operationId: 'updateListingStatus',
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
						schema: { $ref: '#/components/schemas/UpdateStatusInput' },
						example: { status: 'taken' }
					}
				}
			},
			responses: {
				'200': {
					description: 'Status updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											listing: { $ref: '#/components/schemas/PublicListing' }
										}
									}
								}
							}
						}
					}
				},
				'401': { description: 'Authentication required' },
				'403': { description: 'Not authorized' },
				'404': { description: 'Listing not found' }
			}
		}
	}
};

