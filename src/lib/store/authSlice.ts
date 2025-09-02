import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, LoginForm, RegisterForm } from '@/types';

interface AuthSlice extends AuthState {
	login: (credentials: LoginForm) => Promise<User | null>;
	register: (data: RegisterForm) => Promise<void>;
	logout: () => void;
	updateUser: (user: Partial<User>) => void;
	setLoading: (loading: boolean) => void;
}

// Mock users for demo
const mockUsers: User[] = [
	{
		id: '1',
		role: 'student',
		name: 'John Doe',
		email: 'john@fupre.edu.ng',
		phone: '+2348012345678',
		avatarUrl: '/images/avatars/student1.jpg',
		matricNumber: 'FUPRE/20/123456',
		verified: true,
		createdAt: '2024-01-15T10:00:00Z',
		savedListingIds: ['1', '3'],
		unlockedListingIds: ['1']
	},
	{
		id: '2',
		role: 'agent',
		name: 'Sarah Wilson',
		email: 'sarah@fupre.edu.ng',
		phone: '+2348012345679',
		avatarUrl: '/images/avatars/agent1.jpg',
		matricNumber: 'FUPRE/19/123456',
		verified: true,
		createdAt: '2024-01-10T10:00:00Z',
		savedListingIds: [],
		unlockedListingIds: []
	},
	{
		id: '3',
		role: 'owner',
		name: 'Michael Brown',
		email: 'michael@example.com',
		phone: '+2348012345680',
		avatarUrl: '/images/avatars/owner1.jpg',
		verified: true,
		createdAt: '2024-01-05T10:00:00Z',
		savedListingIds: [],
		unlockedListingIds: []
	},
	{
		id: '4',
		role: 'admin',
		name: 'Admin User',
		email: 'admin@fupre.edu.ng',
		phone: '+2348012345681',
		avatarUrl: '/images/avatars/admin1.jpg',
		verified: true,
		createdAt: '2024-01-01T10:00:00Z',
		savedListingIds: [],
		unlockedListingIds: []
	}
];

export const useAuthStore = create<AuthSlice>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,

			login: async (credentials: LoginForm) => {
				set({ isLoading: true });

				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Find user by email
				const user = mockUsers.find((u) => u.email === credentials.email);

				if (user) {
					const token = `mock-jwt-${user.id}-${Math.random()
						.toString(36)
						.substr(2, 9)}`;
					set({
						user,
						token,
						isAuthenticated: true,
						isLoading: false
					});
					return user;
				} else {
					set({ isLoading: false });
					throw new Error('Invalid credentials');
				}
			},

			register: async (data: RegisterForm) => {
				set({ isLoading: true });

				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Create new user
				const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
				const newUser: User = {
					id: userId,
					role: data.role,
					name: data.name,
					email: data.email,
					phone: data.phone,
					verified: false,
					createdAt: new Date().toISOString(),
					savedListingIds: [],
					unlockedListingIds: []
				};

				const token = `mock-jwt-${newUser.id}-${Math.random()
					.toString(36)
					.substr(2, 9)}`;
				set({
					user: newUser,
					token,
					isAuthenticated: true,
					isLoading: false
				});
			},

			logout: () => {
				set({
					user: null,
					token: null,
					isAuthenticated: false,
					isLoading: false
				});
			},

			updateUser: (userData: Partial<User>) => {
				const currentUser = get().user;
				if (currentUser) {
					set({
						user: { ...currentUser, ...userData }
					});
				}
			},

			setLoading: (loading: boolean) => {
				set({ isLoading: loading });
			}
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated
			})
		}
	)
);
