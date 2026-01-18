import { UNIVERSITY_IDS, UNIVERSITIES } from '@/lib/config/universities';

/**
 * OpenAPI Schemas for Listings API
 *
 * Derived from Zod validation schemas
 */

// Get all unique locations from all universities
const allLocations = [...new Set(UNIVERSITIES.flatMap((u) => u.locations))];

// Property types
const PROPERTY_TYPES = ['bedsitter', 'self-con', '1-bedroom', '2-bedroom', '3-bedroom'];

// Availability statuses
const AVAILABILITY_STATUSES = ['available_now', 'available_soon'];

// Predefined amenities
const AMENITIES = [
	'Water',
	'Light (Electricity)',
	'Tiles',
	'POP Ceiling',
	'PVC Ceiling',
	'Fenced Compound',
	'Gated Compound',
	'Wardrobe',
	'Landlord in Compound',
	'Landlord Not in Compound',
	'Private Balcony',
	'Upstairs',
	'Downstairs'
];

export const listingSchemas = {
	// Enums
	University: {
		type: 'string',
		enum: UNIVERSITY_IDS,
		description: 'University identifier'
	},

	Location: {
		type: 'string',
		description: 'Location/area near the university'
	},

	PropertyType: {
		type: 'string',
		enum: PROPERTY_TYPES,
		description: 'Type of property (bedsitter, self-con, 1-bedroom, etc.)'
	},

	AvailabilityStatus: {
		type: 'string',
		enum: AVAILABILITY_STATUSES,
		description: 'Whether property is available now or soon'
	},

	Amenity: {
		type: 'string',
		enum: AMENITIES,
		description: 'Available amenity options'
	},

	ListingStatus: {
		type: 'string',
		enum: ['available', 'taken'],
		description: 'Whether property is taken or available for rent'
	},

	SortBy: {
		type: 'string',
		enum: ['newest', 'oldest', 'price_low', 'price_high', 'rating', 'views'],
		default: 'newest',
		description: 'Sort order for listings'
	},

	// Agent info (public - uses codename)
	ListingAgent: {
		type: 'object',
		properties: {
			id: { type: 'string' },
			name: { type: 'string', description: 'Agent codename (real name hidden until booking)' },
			avatarUrl: { type: 'string', format: 'uri' },
			isVerified: { type: 'boolean' },
			listingsCount: { type: 'integer' }
		}
	},

	// Agent info (revealed after booking)
	ListingAgentUnlocked: {
		type: 'object',
		properties: {
			id: { type: 'string' },
			name: { type: 'string', description: 'Agent codename' },
			realName: { type: 'string', description: 'Agent real name (revealed after booking)' },
			avatarUrl: { type: 'string', format: 'uri' },
			isVerified: { type: 'boolean' },
			listingsCount: { type: 'integer' },
			phone: { type: 'string', description: 'Agent phone number' },
			email: { type: 'string', format: 'email' }
		}
	},

	// Main schemas
	PublicListing: {
		type: 'object',
		properties: {
			id: { type: 'string', description: 'Unique listing identifier' },
			title: { type: 'string', minLength: 5, maxLength: 100 },
			description: { type: 'string', minLength: 20, maxLength: 1000 },
			university: { $ref: '#/components/schemas/University' },
			location: { type: 'string', description: 'Location near university', enum: allLocations },
			propertyType: { $ref: '#/components/schemas/PropertyType' },
			addressApprox: {
				type: 'string',
				description: 'Approximate address (public)'
			},
			priceYearly: {
				type: 'number',
				minimum: 50000,
				maximum: 5000000,
				description: 'Yearly rent in Naira'
			},
			bedrooms: { type: 'integer', minimum: 0, maximum: 5 },
			bathrooms: { type: 'integer', minimum: 1, maximum: 4 },
			walkingMinutes: {
				type: 'integer',
				minimum: 1,
				maximum: 120,
				description: 'Walking time to campus in minutes'
			},
			amenities: {
				type: 'array',
				items: { $ref: '#/components/schemas/Amenity' },
				minItems: 1,
				maxItems: 13
			},
			availabilityStatus: { $ref: '#/components/schemas/AvailabilityStatus' },
			availableFrom: {
				type: 'string',
				format: 'date-time',
				description: 'Date when property becomes available (if status is available_soon)'
			},
			photos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				minItems: 1,
				maxItems: 10
			},
			videos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				maxItems: 3,
				description: 'Property video URLs'
			},
			coverPhoto: { type: 'string', format: 'uri' },
			mapPreview: { type: 'string', format: 'uri' },
			agentId: { type: 'string', description: 'ID of the agent who created the listing' },
			agent: { $ref: '#/components/schemas/ListingAgent' },
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
			'university',
			'location',
			'propertyType',
			'addressApprox',
			'priceYearly',
			'bedrooms',
			'bathrooms',
			'walkingMinutes',
			'amenities',
			'availabilityStatus',
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
						description: 'Full address (revealed after booking inspection)'
					},
					mapFull: {
						type: 'string',
						format: 'uri',
						description: 'Full map image (revealed after booking)'
					},
					landlordName: {
						type: 'string',
						description: 'Landlord/caretaker name (revealed after booking)'
					},
					landlordPhone: {
						type: 'string',
						description: 'Landlord/caretaker phone (revealed after booking)'
					},
					agent: { $ref: '#/components/schemas/ListingAgentUnlocked' }
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
			university: { $ref: '#/components/schemas/University' },
			location: { type: 'string', minLength: 2, maxLength: 50 },
			propertyType: { $ref: '#/components/schemas/PropertyType' },
			addressApprox: { type: 'string', minLength: 5, maxLength: 200 },
			addressFull: { type: 'string', minLength: 10, maxLength: 300 },
			priceYearly: { type: 'number', minimum: 50000, maximum: 5000000 },
			bedrooms: { type: 'integer', minimum: 0, maximum: 5 },
			bathrooms: { type: 'integer', minimum: 1, maximum: 4 },
			walkingMinutes: { type: 'integer', minimum: 1, maximum: 120 },
			amenities: {
				type: 'array',
				items: { $ref: '#/components/schemas/Amenity' },
				minItems: 1,
				maxItems: 13
			},
			availabilityStatus: { $ref: '#/components/schemas/AvailabilityStatus' },
			availableFrom: { type: 'string', format: 'date-time' },
			photos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				minItems: 1,
				maxItems: 10
			},
			videos: {
				type: 'array',
				items: { type: 'string', format: 'uri' },
				maxItems: 3
			},
			coverPhoto: { type: 'string', format: 'uri' },
			mapPreview: { type: 'string', format: 'uri' },
			mapFull: { type: 'string', format: 'uri' },
			landlordName: { type: 'string', maxLength: 100 },
			landlordPhone: { type: 'string', pattern: '^\\+234\\d{10}$' }
		},
		required: [
			'title',
			'description',
			'university',
			'location',
			'propertyType',
			'addressApprox',
			'addressFull',
			'priceYearly',
			'bedrooms',
			'bathrooms',
			'walkingMinutes',
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
			university: { $ref: '#/components/schemas/University' },
			location: { type: 'string', minLength: 2, maxLength: 50 },
			propertyType: { $ref: '#/components/schemas/PropertyType' },
			addressApprox: { type: 'string', minLength: 5, maxLength: 200 },
			addressFull: { type: 'string', minLength: 10, maxLength: 300 },
			priceYearly: { type: 'number', minimum: 50000, maximum: 5000000 },
			bedrooms: { type: 'integer', minimum: 0, maximum: 5 },
			bathrooms: { type: 'integer', minimum: 1, maximum: 4 },
			walkingMinutes: { type: 'integer', minimum: 1, maximum: 120 },
			amenities: { type: 'array', items: { $ref: '#/components/schemas/Amenity' } },
			availabilityStatus: { $ref: '#/components/schemas/AvailabilityStatus' },
			availableFrom: { type: 'string', format: 'date-time' },
			photos: { type: 'array', items: { type: 'string', format: 'uri' } },
			videos: { type: 'array', items: { type: 'string', format: 'uri' } },
			coverPhoto: { type: 'string', format: 'uri' },
			mapPreview: { type: 'string', format: 'uri' },
			mapFull: { type: 'string', format: 'uri' },
			landlordName: { type: 'string', maxLength: 100 },
			landlordPhone: { type: 'string', pattern: '^\\+234\\d{10}$' },
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
					name: 'university',
					in: 'query',
					schema: { $ref: '#/components/schemas/University' },
					description: 'Filter by university'
				},
				{
					name: 'location',
					in: 'query',
					schema: { type: 'string' },
					description: 'Filter by location'
				},
				{
					name: 'propertyType',
					in: 'query',
					schema: { $ref: '#/components/schemas/PropertyType' },
					description: 'Filter by property type'
				},
				{
					name: 'minPrice',
					in: 'query',
					schema: { type: 'number', minimum: 0 },
					description: 'Minimum yearly price filter'
				},
				{
					name: 'maxPrice',
					in: 'query',
					schema: { type: 'number', maximum: 10000000 },
					description: 'Maximum yearly price filter'
				},
				{
					name: 'bedrooms',
					in: 'query',
					schema: { type: 'integer', minimum: 0, maximum: 5 },
					description: 'Filter by bedroom count'
				},
				{
					name: 'bathrooms',
					in: 'query',
					schema: { type: 'integer', minimum: 1, maximum: 4 },
					description: 'Filter by bathroom count'
				},
				{
					name: 'availabilityStatus',
					in: 'query',
					schema: { $ref: '#/components/schemas/AvailabilityStatus' },
					description: 'Filter by availability status'
				},
				{
					name: 'status',
					in: 'query',
					schema: { $ref: '#/components/schemas/ListingStatus' },
					description: 'Filter by listing status'
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
							title: 'Modern Self-Con Apartment near FUPRE',
							description:
								'Spacious self-contained apartment with modern amenities, perfect for students.',
							university: 'fupre',
							location: 'Ugbomro',
							propertyType: 'self-con',
							addressApprox: 'Off Main Road, Ugbomro',
							addressFull: 'No 15, Peace Avenue, Off Main Road, Ugbomro',
							priceYearly: 450000,
							bedrooms: 1,
							bathrooms: 1,
							walkingMinutes: 15,
							amenities: ['Water', 'Light (Electricity)', 'Tiles', 'Gated Compound'],
							availabilityStatus: 'available_now',
							photos: ['https://example.com/photo1.jpg'],
							coverPhoto: 'https://example.com/cover.jpg',
							mapPreview: 'https://example.com/map-preview.jpg',
							mapFull: 'https://example.com/map-full.jpg',
							landlordName: 'Mr. Johnson',
							landlordPhone: '+2348012345678'
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
				'Fetch a listing by ID. Returns private fields if user has booked inspection.',
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
