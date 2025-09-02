import { Role } from '@/types';

/**
 * Check if user has required role
 */
export function hasRole(
	userRole: Role | undefined,
	requiredRole: Role
): boolean {
	if (!userRole) return false;

	// Admin has access to everything
	if (userRole === 'admin') return true;

	// Owner has access to owner and student features
	if (
		userRole === 'owner' &&
		(requiredRole === 'owner' || requiredRole === 'student')
	)
		return true;

	// Agent has access to agent and student features
	if (
		userRole === 'agent' &&
		(requiredRole === 'agent' || requiredRole === 'student')
	)
		return true;

	// Student only has access to student features
	if (userRole === 'student' && requiredRole === 'student') return true;

	return false;
}

/**
 * Check if user can access agent features
 */
export function canAccessAgent(userRole: Role | undefined): boolean {
	return hasRole(userRole, 'agent');
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(userRole: Role | undefined): boolean {
	return hasRole(userRole, 'admin');
}

/**
 * Check if user can create listings
 */
export function canCreateListings(userRole: Role | undefined): boolean {
	return hasRole(userRole, 'agent');
}

/**
 * Check if user can create roommate listings
 */
export function canCreateRoommateListings(userRole: Role | undefined): boolean {
	return hasRole(userRole, 'student') || hasRole(userRole, 'owner');
}
