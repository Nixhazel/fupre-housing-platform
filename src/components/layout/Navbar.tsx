'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
	Search,
	Menu,
	X,
	User,
	LogOut,
	Settings,
	Home,
	Building2,
	Users,
	BarChart3,
	Moon,
	Sun,
	Loader2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLogout } from '@/hooks/api/useAuth';
import { ClientOnly } from '@/components/providers/ClientOnly';
import { toast } from 'sonner';

function NavbarContent() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const { theme, setTheme } = useTheme();
	const { user, isAuthenticated } = useAuth();
	const logoutMutation = useLogout();
	const router = useRouter();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery('');
		}
	};

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success('Logged out successfully');
				router.push('/');
			},
			onError: () => {
				// Even on error, redirect (cache is cleared)
				router.push('/');
			}
		});
	};

	const getDashboardLink = () => {
		if (!user) return '/auth/login';

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

	const getDashboardIcon = () => {
		if (!user) return <User className='h-4 w-4' />;

		switch (user.role) {
			case 'agent':
				return <BarChart3 className='h-4 w-4' />;
			case 'admin':
				return <Settings className='h-4 w-4' />;
			case 'owner':
				return <Users className='h-4 w-4' />;
			default:
				return <Home className='h-4 w-4' />;
		}
	};

	return (
		<nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
			<div className='container mx-auto px-4'>
				<div className='flex h-16 items-center justify-between'>
					{/* Logo */}
					<Link href='/' className='flex items-center space-x-2'>
						<Image
							src='/images/easyvill-logo.png'
							alt='EasyVille Estates'
							width={40}
							height={40}
							className='h-10 w-10 object-contain'
						/>
						<span className='text-xl font-bold hidden sm:inline'>
							EasyVille Estates
						</span>
					</Link>

					{/* Desktop Search */}
					<form
						onSubmit={handleSearch}
						className='hidden md:flex flex-1 max-w-md mx-8'>
						<div className='relative w-full'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								type='text'
								placeholder='Search listings...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>
					</form>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center space-x-4'>
						<Link href='/listings'>
							<Button variant='ghost' size='sm'>
								<Building2 className='h-4 w-4 mr-2' />
								Listings
							</Button>
						</Link>
						<Link href='/roommates'>
							<Button variant='ghost' size='sm'>
								<Users className='h-4 w-4 mr-2' />
								Roommates
							</Button>
						</Link>

						{/* Theme Toggle */}
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
							{theme === 'dark' ? (
								<Sun className='h-4 w-4' />
							) : (
								<Moon className='h-4 w-4' />
							)}
						</Button>

						{/* Auth Menu */}
						{isAuthenticated && user?.name ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='flex items-center space-x-2'>
										<div className='h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center'>
											<span className='text-xs font-medium'>
												{user.name.charAt(0).toUpperCase()}
											</span>
										</div>
										<span className='hidden lg:inline'>{user.name}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-56'>
									<DropdownMenuLabel>My Account</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link
											href={getDashboardLink()}
											className='flex items-center'>
											{getDashboardIcon()}
											<span className='ml-2'>Dashboard</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href='/profile' className='flex items-center'>
											<User className='h-4 w-4' />
											<span className='ml-2'>Profile</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className='text-red-600'
										disabled={logoutMutation.isPending}>
										{logoutMutation.isPending ? (
											<Loader2 className='h-4 w-4 animate-spin' />
										) : (
											<LogOut className='h-4 w-4' />
										)}
										<span className='ml-2'>Logout</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className='flex items-center space-x-2'>
								<Link href='/auth/login'>
									<Button variant='ghost' size='sm'>
										Login
									</Button>
								</Link>
								<Link href='/auth/register'>
									<Button size='sm'>Sign Up</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<Button
						variant='ghost'
						size='sm'
						className='md:hidden'
						onClick={() => setIsMenuOpen(!isMenuOpen)}>
						{isMenuOpen ? (
							<X className='h-5 w-5' />
						) : (
							<Menu className='h-5 w-5' />
						)}
					</Button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className='md:hidden border-t py-4'>
						{/* Mobile Search */}
						<form onSubmit={handleSearch} className='mb-4'>
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
								<Input
									type='text'
									placeholder='Search listings...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-10'
								/>
							</div>
						</form>

						{/* Mobile Navigation Links */}
						<div className='space-y-2'>
							<Link href='/listings' onClick={() => setIsMenuOpen(false)}>
								<Button variant='ghost' className='w-full justify-start'>
									<Building2 className='h-4 w-4 mr-2' />
									Listings
								</Button>
							</Link>
							<Link href='/roommates' onClick={() => setIsMenuOpen(false)}>
								<Button variant='ghost' className='w-full justify-start'>
									<Users className='h-4 w-4 mr-2' />
									Roommates
								</Button>
							</Link>

							{/* Theme Toggle */}
							<Button
								variant='ghost'
								className='w-full justify-start'
								onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
								{theme === 'dark' ? (
									<Sun className='h-4 w-4 mr-2' />
								) : (
									<Moon className='h-4 w-4 mr-2' />
								)}
								{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
							</Button>

							{/* Mobile Auth */}
							{isAuthenticated && user?.name ? (
								<div className='space-y-2 pt-2 border-t'>
									<div className='px-3 py-2 text-sm text-muted-foreground'>
										Signed in as {user.name}
									</div>
									<Link
										href={getDashboardLink()}
										onClick={() => setIsMenuOpen(false)}>
										<Button variant='ghost' className='w-full justify-start'>
											{getDashboardIcon()}
											<span className='ml-2'>Dashboard</span>
										</Button>
									</Link>
									<Link href='/profile' onClick={() => setIsMenuOpen(false)}>
										<Button variant='ghost' className='w-full justify-start'>
											<User className='h-4 w-4' />
											<span className='ml-2'>Profile</span>
										</Button>
									</Link>
									<Button
										variant='ghost'
										className='w-full justify-start text-red-600'
										onClick={handleLogout}
										disabled={logoutMutation.isPending}>
										{logoutMutation.isPending ? (
											<Loader2 className='h-4 w-4' />
										) : (
											<LogOut className='h-4 w-4' />
										)}
										<span className='ml-2'>Logout</span>
									</Button>
								</div>
							) : (
								<div className='space-y-2 pt-2 border-t'>
									<Link href='/auth/login' onClick={() => setIsMenuOpen(false)}>
										<Button variant='ghost' className='w-full'>
											Login
										</Button>
									</Link>
									<Link
										href='/auth/register'
										onClick={() => setIsMenuOpen(false)}>
										<Button className='w-full'>Sign Up</Button>
									</Link>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</div>
		</nav>
	);
}

export function Navbar() {
	return (
		<ClientOnly fallback={<div className='h-16 bg-background border-b' />}>
			<NavbarContent />
		</ClientOnly>
	);
}
