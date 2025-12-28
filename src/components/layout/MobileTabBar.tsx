'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Building2, Users, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { ClientOnly } from '@/components/providers/ClientOnly';

const tabs = [
	{
		name: 'Home',
		href: '/',
		icon: Home,
		roles: ['student', 'agent', 'owner', 'admin']
	},
	{
		name: 'Listings',
		href: '/listings',
		icon: Building2,
		roles: ['student', 'agent', 'owner', 'admin']
	},
	{
		name: 'Roommates',
		href: '/roommates',
		icon: Users,
		roles: ['student', 'agent', 'owner', 'admin']
	},
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: BarChart3,
		roles: ['agent', 'owner', 'admin']
	},
	{
		name: 'Profile',
		href: '/profile',
		icon: User,
		roles: ['student', 'agent', 'owner', 'admin']
	}
];

function MobileTabBarContent() {
	const pathname = usePathname();
	const { user, isAuthenticated } = useAuth();

	// Don't show on auth pages or if not authenticated
	if (!isAuthenticated || !user || pathname.startsWith('/auth')) {
		return null;
	}

	// Filter tabs based on user role
	const availableTabs = tabs.filter(
		(tab) => tab.roles.includes(user.role) || tab.roles.includes('student')
	);

	// Get dashboard link based on role
	const getDashboardHref = () => {
		switch (user.role) {
			case 'agent':
				return '/dashboard/agent';
			case 'admin':
				return '/dashboard/admin';
			case 'owner':
				return '/roommates';
			default:
				return '/listings';
		}
	};

	return (
		<div className='fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t md:hidden'>
			<div className='flex items-center justify-around h-16'>
				{availableTabs.map((tab) => {
					const isActive =
						pathname === tab.href ||
						(tab.name === 'Dashboard' && pathname.startsWith('/dashboard')) ||
						(tab.name === 'Profile' && pathname.startsWith('/profile'));

					const href = tab.name === 'Dashboard' ? getDashboardHref() : tab.href;

					return (
						<Link
							key={tab.name}
							href={href}
							className={cn(
								'flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors',
								isActive
									? 'text-primary'
									: 'text-muted-foreground hover:text-foreground'
							)}>
							<motion.div whileTap={{ scale: 0.95 }} className='relative'>
								<tab.icon className='h-5 w-5' />
								{isActive && (
									<motion.div
										layoutId='activeTab'
										className='absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2'
										initial={false}
										transition={{ type: 'spring', stiffness: 500, damping: 30 }}
									/>
								)}
							</motion.div>
							<span className='text-xs font-medium'>{tab.name}</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

export function MobileTabBar() {
	return (
		<ClientOnly>
			<MobileTabBarContent />
		</ClientOnly>
	);
}
