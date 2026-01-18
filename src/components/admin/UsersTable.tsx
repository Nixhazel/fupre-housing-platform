'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
	Search,
	Users,
	ChevronLeft,
	ChevronRight,
	Edit,
	Shield,
	ShieldCheck,
	ShieldX,
	MoreHorizontal,
	Mail,
	Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/shared/Badge';
import { useUsers, useVerifyAgent, useUnverifyAgent, UsersFilters } from '@/hooks/api/useAdmin';
import { SessionUser } from '@/lib/api/types';
import { UserEditModal } from './UserEditModal';
import { toast } from 'sonner';
import { dayjs } from '@/lib/utils/date';

export function UsersTable() {
	const [filters, setFilters] = useState<UsersFilters>({
		page: 1,
		limit: 10,
		sortBy: 'newest'
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedUser, setSelectedUser] = useState<SessionUser | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	// Apply search with debounce effect handled manually
	const [debouncedSearch, setDebouncedSearch] = useState('');

	// Debounce search
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		// Simple debounce using setTimeout
		setTimeout(() => {
			setDebouncedSearch(value);
		}, 300);
	};

	const { data, isLoading, isError } = useUsers({
		...filters,
		search: debouncedSearch || undefined
	});

	const verifyMutation = useVerifyAgent();
	const unverifyMutation = useUnverifyAgent();

	const users = data?.users ?? [];
	const pagination = data?.pagination;

	const handleVerifyToggle = (user: SessionUser) => {
		if (user.isVerified) {
			unverifyMutation.mutate(user.id, {
				onSuccess: () => toast.success(`${user.name} has been unverified`),
				onError: (err) => toast.error(err.message || 'Failed to unverify user')
			});
		} else {
			verifyMutation.mutate(user.id, {
				onSuccess: () => toast.success(`${user.name} has been verified`),
				onError: (err) => toast.error(err.message || 'Failed to verify user')
			});
		}
	};

	const handleEdit = (user: SessionUser) => {
		setSelectedUser(user);
		setIsEditModalOpen(true);
	};

	const handlePageChange = (newPage: number) => {
		setFilters((prev) => ({ ...prev, page: newPage }));
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case 'admin':
				return 'destructive';
			case 'agent':
				return 'default';
			case 'owner':
				return 'secondary';
			default:
				return 'outline';
		}
	};

	return (
		<div className='space-y-4'>
			{/* Filters */}
			<div className='flex flex-col sm:flex-row gap-4'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search by name or email...'
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
						className='pl-10'
					/>
				</div>
				<div className='flex gap-2'>
					<Select
						value={filters.role || 'all'}
						onValueChange={(value) =>
							setFilters((prev) => ({
								...prev,
								role: value === 'all' ? undefined : (value as UsersFilters['role']),
								page: 1
							}))
						}>
						<SelectTrigger className='w-[130px]'>
							<SelectValue placeholder='All roles' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Roles</SelectItem>
							<SelectItem value='student'>Student</SelectItem>
							<SelectItem value='agent'>Agent</SelectItem>
							<SelectItem value='owner'>Owner</SelectItem>
							<SelectItem value='admin'>Admin</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={filters.isVerified === undefined ? 'all' : filters.isVerified.toString()}
						onValueChange={(value) =>
							setFilters((prev) => ({
								...prev,
								isVerified:
									value === 'all' ? undefined : value === 'true',
								page: 1
							}))
						}>
						<SelectTrigger className='w-[130px]'>
							<SelectValue placeholder='Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Status</SelectItem>
							<SelectItem value='true'>Verified</SelectItem>
							<SelectItem value='false'>Unverified</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Table */}
			{isLoading ? (
				<div className='space-y-4'>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className='flex items-center space-x-4 p-4 border rounded-lg'>
							<Skeleton className='w-10 h-10 rounded-full' />
							<div className='flex-1 space-y-2'>
								<Skeleton className='h-5 w-32' />
								<Skeleton className='h-4 w-48' />
							</div>
							<Skeleton className='h-6 w-16' />
						</div>
					))}
				</div>
			) : isError ? (
				<div className='text-center py-8'>
					<Users className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
					<h3 className='text-lg font-semibold mb-2'>Failed to load users</h3>
					<p className='text-muted-foreground'>
						An error occurred while loading users. Please try again.
					</p>
				</div>
			) : users.length === 0 ? (
				<div className='text-center py-8'>
					<Users className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
					<h3 className='text-lg font-semibold mb-2'>No users found</h3>
					<p className='text-muted-foreground'>
						{searchQuery || filters.role
							? 'Try adjusting your search or filters'
							: 'No users registered yet'}
					</p>
				</div>
			) : (
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead className='text-right'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user, index) => (
								<motion.tr
									key={user.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.2, delay: index * 0.03 }}
									className='border-b transition-colors hover:bg-muted/50'>
									<TableCell>
										<div className='flex items-center gap-3'>
											<div className='relative w-10 h-10 shrink-0'>
												{user.avatarUrl ? (
													<Image
														src={user.avatarUrl}
														alt={user.name}
														fill
														sizes='40px'
														className='rounded-full object-cover'
													/>
												) : (
													<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
														<span className='text-sm font-semibold text-primary'>
															{user.name.charAt(0).toUpperCase()}
														</span>
													</div>
												)}
											</div>
											<div>
												<p className='font-medium'>{user.name}</p>
												<p className='text-sm text-muted-foreground'>
													{user.email}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={getRoleBadgeVariant(user.role)}>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											{user.isVerified ? (
												<>
													<ShieldCheck className='h-4 w-4 text-green-500' />
													<span className='text-sm text-green-600'>Verified</span>
												</>
											) : (
												<>
													<Shield className='h-4 w-4 text-muted-foreground' />
													<span className='text-sm text-muted-foreground'>
														Unverified
													</span>
												</>
											)}
											{user.isEmailVerified && (
												<Badge variant='outline' className='text-xs'>
													Email ✓
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className='flex flex-col gap-1 text-sm'>
											{user.phone && (
												<div className='flex items-center gap-1 text-muted-foreground'>
													<Phone className='h-3 w-3' />
													<span>{user.phone}</span>
												</div>
											)}
											{!user.phone && (
												<span className='text-muted-foreground'>—</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<span className='text-sm text-muted-foreground'>
											{dayjs(user.createdAt).format('MMM D, YYYY')}
										</span>
									</TableCell>
									<TableCell className='text-right'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='ghost' size='sm'>
													<MoreHorizontal className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem onClick={() => handleEdit(user)}>
													<Edit className='h-4 w-4 mr-2' />
													Edit User
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => handleVerifyToggle(user)}
													disabled={
														verifyMutation.isPending || unverifyMutation.isPending
													}>
													{user.isVerified ? (
														<>
															<ShieldX className='h-4 w-4 mr-2' />
															Unverify
														</>
													) : (
														<>
															<ShieldCheck className='h-4 w-4 mr-2' />
															Verify
														</>
													)}
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => {
														navigator.clipboard.writeText(user.email);
														toast.success('Email copied');
													}}>
													<Mail className='h-4 w-4 mr-2' />
													Copy Email
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</motion.tr>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<div className='flex items-center justify-between'>
					<p className='text-sm text-muted-foreground'>
						Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
						{Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
						{pagination.total} users
					</p>
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => handlePageChange(pagination.page - 1)}
							disabled={pagination.page === 1}>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<span className='text-sm'>
							Page {pagination.page} of {pagination.totalPages}
						</span>
						<Button
							variant='outline'
							size='sm'
							onClick={() => handlePageChange(pagination.page + 1)}
							disabled={pagination.page === pagination.totalPages}>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			<UserEditModal
				user={selectedUser}
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedUser(null);
				}}
			/>
		</div>
	);
}

