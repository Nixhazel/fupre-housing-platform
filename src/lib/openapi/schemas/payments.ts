/**
 * OpenAPI Schemas for Payments API
 */

export const paymentProofSchemas = {
	PaymentProof: {
		type: 'object',
		properties: {
			_id: { type: 'string', description: 'Unique identifier' },
			listingId: { type: 'string', description: 'Associated listing ID' },
			userId: { type: 'string', description: 'User who submitted the proof' },
			amount: { type: 'number', description: 'Payment amount (₦1,000)', example: 1000 },
			method: {
				type: 'string',
				enum: ['bank_transfer', 'ussd', 'pos'],
				description: 'Payment method used'
			},
			reference: { type: 'string', description: 'Transaction reference' },
			imageUrl: { type: 'string', description: 'URL of receipt image' },
			status: {
				type: 'string',
				enum: ['pending', 'approved', 'rejected'],
				description: 'Current status of the proof'
			},
			rejectionReason: { type: 'string', description: 'Reason for rejection (if rejected)' },
			reviewedByAdminId: { type: 'string', description: 'Admin who reviewed' },
			reviewedAt: { type: 'string', format: 'date-time', description: 'When reviewed' },
			submittedAt: { type: 'string', format: 'date-time', description: 'Submission timestamp' },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' }
		}
	},
	SubmitPaymentProofRequest: {
		type: 'object',
		required: ['listingId', 'method', 'reference', 'imageUrl'],
		properties: {
			listingId: { type: 'string', description: 'ID of listing to unlock' },
			amount: { type: 'number', default: 1000, description: 'Fixed at ₦1,000' },
			method: {
				type: 'string',
				enum: ['bank_transfer', 'ussd', 'pos'],
				description: 'Payment method'
			},
			reference: { type: 'string', minLength: 5, maxLength: 50, description: 'Transaction reference' },
			imageUrl: { type: 'string', format: 'uri', description: 'Cloudinary URL of receipt' }
		}
	},
	ReviewPaymentProofRequest: {
		type: 'object',
		required: ['status'],
		properties: {
			status: {
				type: 'string',
				enum: ['approved', 'rejected'],
				description: 'New status'
			},
			rejectionReason: {
				type: 'string',
				minLength: 10,
				maxLength: 500,
				description: 'Required when rejecting'
			}
		}
	}
};

export const paymentProofPaths = {
	'/api/payments/proofs': {
		post: {
			tags: ['Payments'],
			summary: 'Submit payment proof',
			description: 'Submit a payment proof to unlock a listing. Authenticated users only.',
			security: [{ cookieAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/SubmitPaymentProofRequest' }
					}
				}
			},
			responses: {
				'201': {
					description: 'Payment proof submitted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											proof: { $ref: '#/components/schemas/PaymentProof' }
										}
									}
								}
							}
						}
					}
				},
				'400': { description: 'Validation error' },
				'401': { description: 'Not authenticated' },
				'409': { description: 'Already unlocked or pending proof exists' }
			}
		},
		get: {
			tags: ['Payments'],
			summary: 'Get my payment proofs',
			description: 'Get all payment proofs submitted by the current user.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } },
				{ name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } }
			],
			responses: {
				'200': {
					description: 'List of payment proofs',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											proofs: {
												type: 'array',
												items: { $ref: '#/components/schemas/PaymentProof' }
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
		}
	},
	'/api/payments/proofs/pending': {
		get: {
			tags: ['Payments', 'Admin'],
			summary: 'Get pending proofs (Admin)',
			description: 'Get all pending payment proofs awaiting review. Admin only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } }
			],
			responses: {
				'200': { description: 'List of pending proofs' },
				'401': { description: 'Not authenticated' },
				'403': { description: 'Admin access required' }
			}
		}
	},
	'/api/payments/proofs/{id}': {
		get: {
			tags: ['Payments'],
			summary: 'Get payment proof by ID',
			description: 'Get details of a specific payment proof. Owner or admin only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			responses: {
				'200': { description: 'Payment proof details' },
				'403': { description: 'Access denied' },
				'404': { description: 'Proof not found' }
			}
		},
		patch: {
			tags: ['Payments', 'Admin'],
			summary: 'Review payment proof (Admin)',
			description: 'Approve or reject a payment proof. Admin only.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ReviewPaymentProofRequest' }
					}
				}
			},
			responses: {
				'200': { description: 'Proof reviewed successfully' },
				'400': { description: 'Validation error or already reviewed' },
				'403': { description: 'Admin access required' },
				'404': { description: 'Proof not found' }
			}
		}
	},
	'/api/users/me/saved': {
		get: {
			tags: ['Users'],
			summary: 'Get saved listings',
			description: 'Get all listings saved by the current user.',
			security: [{ cookieAuth: [] }],
			responses: {
				'200': { description: 'List of saved listings' },
				'401': { description: 'Not authenticated' }
			}
		},
		post: {
			tags: ['Users'],
			summary: 'Save a listing',
			description: 'Add a listing to saved favorites.',
			security: [{ cookieAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['listingId'],
							properties: {
								listingId: { type: 'string' }
							}
						}
					}
				}
			},
			responses: {
				'200': { description: 'Listing saved successfully' },
				'404': { description: 'Listing not found' },
				'409': { description: 'Already saved' }
			}
		}
	},
	'/api/users/me/saved/{id}': {
		delete: {
			tags: ['Users'],
			summary: 'Unsave a listing',
			description: 'Remove a listing from saved favorites.',
			security: [{ cookieAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' }
			],
			responses: {
				'200': { description: 'Listing removed from saved' },
				'404': { description: 'Listing not in saved list' }
			}
		}
	}
};

