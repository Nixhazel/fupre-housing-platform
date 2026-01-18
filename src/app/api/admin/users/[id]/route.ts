import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAdmin, type AuthContext } from '@/lib/auth/guards';
import * as adminService from '@/lib/services/admin.service';
import {
	successResponse,
	validationErrorResponse,
	notFoundResponse,
	forbiddenResponse,
	handleError
} from '@/lib/api/response';

// Next.js 15 route params type
type RouteParams = { params: Promise<{ id: string }> };

const updateUserSchema = z.object({
	isVerified: z.boolean().optional(),
	role: z.enum(['student', 'agent', 'owner']).optional()
});

/**
 * GET /api/admin/users/[id]
 *
 * Get a single user by ID (admin only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: User ID
 *
 * Response: { success, data: { user } }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	const handler = withAdmin(
		async () => {
			try {
				const { id: userId } = await params;

				if (!userId) {
					return notFoundResponse('User ID is required');
				}

				const user = await adminService.getUserById(userId);

				return successResponse({ user });
			} catch (error) {
				return handleError(error);
			}
		}
	);

	return handler(request);
}

/**
 * PATCH /api/admin/users/[id]
 *
 * Update a user (admin only)
 * Can verify agents, change roles
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: User ID
 * Body: { isVerified?, role? }
 *
 * Response: { success, data: { user } }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const handler = withAdmin(
		async (req: NextRequest) => {
			try {
				const { id: userId } = await params;

				if (!userId) {
					return notFoundResponse('User ID is required');
				}

				const body = await req.json();
				const validation = updateUserSchema.safeParse(body);

				if (!validation.success) {
					return validationErrorResponse(validation.error);
				}

				const user = await adminService.updateUser(userId, validation.data);

				return successResponse({ user });
			} catch (error) {
				if (error instanceof Error) {
					if (error.message.includes('not found')) {
						return notFoundResponse(error.message);
					}
				}
				return handleError(error);
			}
		}
	);

	return handler(request);
}

/**
 * DELETE /api/admin/users/[id]
 *
 * Soft delete a user (admin only)
 *
 * Headers: Cookie (access_token, refresh_token)
 * Path Parameters:
 * - id: User ID
 *
 * Response: { success, data: { message } }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const handler = withAdmin(
		async (_req: NextRequest, context: AuthContext) => {
			try {
				const { id: userId } = await params;

				if (!userId) {
					return notFoundResponse('User ID is required');
				}

				const result = await adminService.deleteUser(userId, context.user.userId);

				return successResponse(result);
			} catch (error) {
				if (error instanceof Error) {
					if (error.message.includes('not found')) {
						return notFoundResponse(error.message);
					}
					if (error.message.includes('Cannot')) {
						return forbiddenResponse(error.message);
					}
				}
				return handleError(error);
			}
		}
	);

	return handler(request);
}

