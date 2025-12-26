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
						schema: { $ref: '#/components/schemas/CreateRoommateListingRequest' },
						example: {
							title: 'Looking for a quiet roommate near Ugbomro',
							budgetMonthly: 25000,
							moveInDate: '2024-03-01',
							description: 'I am a final year student looking for a neat and studious roommate to share a 2-bedroom apartment.',
							photos: ['https://res.cloudinary.com/demo/image/upload/room1.jpg'],
							preferences: {
								gender: 'male',
								cleanliness: 'high',
								studyHours: 'night',
								smoking: 'no',
								pets: 'no'
							}
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
											listing: { $ref: '#/components/schemas/RoommateListing' }
										}
									}
								}
							}
						}
					}
				},
				'400': {
					description: 'Validation error',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				},
				'401': {
					description: 'Not authenticated',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				},
				'403': {
					description: 'Only students and owners allowed',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
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
				'200': {
					description: 'User\'s roommate listings',
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
				},
				'401': {
					description: 'Not authenticated',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
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
				'200': {
					description: 'Roommate listing details',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											listing: { $ref: '#/components/schemas/RoommateListing' }
										}
									}
								}
							}
						}
					}
				},
				'404': {
					description: 'Listing not found',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
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
				'200': {
					description: 'Listing updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											listing: { $ref: '#/components/schemas/RoommateListing' }
										}
									}
								}
							}
						}
					}
				},
				'400': {
					description: 'Validation error',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				},
				'403': {
					description: 'Not owner',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				},
				'404': {
					description: 'Listing not found',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
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
				'200': {
					description: 'Listing deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											message: { type: 'string', example: 'Roommate listing deleted successfully' }
										}
									}
								}
							}
						}
					}
				},
				'403': {
					description: 'Not owner',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				},
				'404': {
					description: 'Listing not found',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
			}
		}
	},
	'/api/users/me/saved-roommates': {
		get: {
			tags: ['Users', 'Roommates'],
			summary: 'Get saved roommate listings',
			description: 'Get all roommate listings saved by the current user.',
			security: [{ cookieAuth: [] }],
			responses: {
				'200': {
					description: 'List of saved roommate listings',
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
											}
										}
									}
								}
							}
						}
					}
				},
				'401': {
					description: 'Not authenticated',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
			}
		},
		post: {
			tags: ['Users', 'Roommates'],
			summary: 'Save a roommate listing',
			description: 'Add a roommate listing to saved favorites.',
			security: [{ cookieAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['listingId'],
							properties: {
								listingId: { type: 'string', example: '507f1f77bcf86cd799439011' }
							}
						}
					}
				}
			},
			responses: {
				'200': {
					description: 'Roommate listing saved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											message: { type: 'string', example: 'Roommate listing saved' },
											savedRoommateIds: {
												type: 'array',
												items: { type: 'string' }
											}
										}
									}
								}
							}
						}
					}
				},
				'404': {
					description: 'Listing not found',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
			}
		}
	},
	'/api/users/me/saved-roommates/{id}': {
		delete: {
			tags: ['Users', 'Roommates'],
			summary: 'Unsave a roommate listing',
			description: 'Remove a roommate listing from saved favorites.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Roommate listing ID' }
			],
			responses: {
				'200': {
					description: 'Roommate listing removed from saved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											message: { type: 'string', example: 'Roommate listing removed from saved' },
											savedRoommateIds: {
												type: 'array',
												items: { type: 'string' }
											}
										}
									}
								}
							}
						}
					}
				},
				'404': {
					description: 'Listing not in saved list',
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
				}
			}
		}
	}
};

