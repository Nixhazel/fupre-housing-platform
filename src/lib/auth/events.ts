/**
 * Auth Events
 *
 * Custom events for auth state changes.
 * These allow components to react to auth changes without prop drilling.
 */

/**
 * Auth event types
 */
export type AuthEventType =
	| 'auth:login'
	| 'auth:logout'
	| 'auth:session-expired'
	| 'auth:forbidden'
	| 'auth:refresh';

/**
 * Auth event detail payloads
 */
export interface AuthEventPayloads {
	'auth:login': { userId: string; role: string };
	'auth:logout': { reason?: 'user' | 'expired' | 'error' };
	'auth:session-expired': { returnUrl?: string };
	'auth:forbidden': { resource?: string };
	'auth:refresh': { success: boolean };
}

/**
 * Create and dispatch an auth event
 */
export function dispatchAuthEvent<T extends AuthEventType>(
	type: T,
	detail?: AuthEventPayloads[T]
): void {
	if (typeof window === 'undefined') return;

	const event = new CustomEvent(type, {
		detail,
		bubbles: true,
		cancelable: true
	});

	window.dispatchEvent(event);

	if (process.env.NODE_ENV === 'development') {
		console.log(`[Auth Event] ${type}`, detail);
	}
}

/**
 * Subscribe to auth events
 */
export function subscribeToAuthEvent<T extends AuthEventType>(
	type: T,
	handler: (detail: AuthEventPayloads[T]) => void
): () => void {
	if (typeof window === 'undefined') {
		return () => {};
	}

	const listener = (event: Event) => {
		handler((event as CustomEvent<AuthEventPayloads[T]>).detail);
	};

	window.addEventListener(type, listener);

	return () => {
		window.removeEventListener(type, listener);
	};
}

/**
 * Subscribe to multiple auth events
 */
export function subscribeToAuthEvents(
	handlers: Partial<{
		[K in AuthEventType]: (detail: AuthEventPayloads[K]) => void;
	}>
): () => void {
	const unsubscribers: (() => void)[] = [];

	(Object.entries(handlers) as [AuthEventType, (detail: unknown) => void][]).forEach(
		([type, handler]) => {
			if (handler) {
				unsubscribers.push(subscribeToAuthEvent(type, handler));
			}
		}
	);

	return () => {
		unsubscribers.forEach((unsub) => unsub());
	};
}

