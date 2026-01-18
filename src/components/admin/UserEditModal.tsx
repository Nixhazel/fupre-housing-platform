'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Shield, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUpdateUser, useDeleteUser, UpdateUserData } from '@/hooks/api/useAdmin';
import { SessionUser } from '@/lib/api/types';
import { toast } from 'sonner';

interface UserEditModalProps {
	user: SessionUser | null;
	isOpen: boolean;
	onClose: () => void;
}

export function UserEditModal({ user, isOpen, onClose }: UserEditModalProps) {
	const [formData, setFormData] = useState<UpdateUserData>({
		name: '',
		phone: '',
		role: 'student',
		isVerified: false
	});
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const updateMutation = useUpdateUser();
	const deleteMutation = useDeleteUser();

	// Populate form when user changes
	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name,
				phone: user.phone || '',
				role: user.role,
				isVerified: user.isVerified
			});
		}
	}, [user]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		updateMutation.mutate(
			{ id: user.id, data: formData },
			{
				onSuccess: () => {
					toast.success('User updated successfully');
					onClose();
				},
				onError: (err) => {
					toast.error(err.message || 'Failed to update user');
				}
			}
		);
	};

	const handleDelete = () => {
		if (!user) return;

		deleteMutation.mutate(user.id, {
			onSuccess: () => {
				toast.success('User deleted successfully');
				onClose();
			},
			onError: (err) => {
				toast.error(err.message || 'Failed to delete user');
			}
		});
	};

	if (!isOpen || !user) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
				}}>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					className='bg-background rounded-lg shadow-xl w-full max-w-md border'>
					{/* Header */}
					<div className='flex items-center justify-between p-4 border-b'>
						<h2 className='text-lg font-semibold'>Edit User</h2>
						<Button variant='ghost' size='sm' onClick={onClose}>
							<X className='h-4 w-4' />
						</Button>
					</div>

					{/* Content */}
					<form onSubmit={handleSubmit}>
						<div className='p-4 space-y-4'>
							{/* User Info Header */}
							<div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
								<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
									<span className='text-sm font-semibold text-primary'>
										{user.name.charAt(0).toUpperCase()}
									</span>
								</div>
								<div>
									<p className='font-medium'>{user.name}</p>
									<p className='text-sm text-muted-foreground'>{user.email}</p>
								</div>
							</div>

							{/* Name */}
							<div className='space-y-2'>
								<Label htmlFor='name'>Name</Label>
								<Input
									id='name'
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder='Enter name'
								/>
							</div>

							{/* Phone */}
							<div className='space-y-2'>
								<Label htmlFor='phone'>Phone</Label>
								<Input
									id='phone'
									value={formData.phone}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, phone: e.target.value }))
									}
									placeholder='+234XXXXXXXXXX'
								/>
							</div>

							{/* Role */}
							<div className='space-y-2'>
								<Label htmlFor='role'>Role</Label>
								<Select
									value={formData.role}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											role: value as UpdateUserData['role']
										}))
									}>
									<SelectTrigger>
										<SelectValue placeholder='Select role' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='student'>Student</SelectItem>
										<SelectItem value='agent'>Agent</SelectItem>
										<SelectItem value='owner'>Owner</SelectItem>
										<SelectItem value='admin'>Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Verified Toggle */}
							<div className='flex items-center justify-between p-3 rounded-lg border'>
								<div className='flex items-center gap-3'>
									{formData.isVerified ? (
										<ShieldCheck className='h-5 w-5 text-green-500' />
									) : (
										<Shield className='h-5 w-5 text-muted-foreground' />
									)}
									<div>
										<p className='font-medium'>Verified Status</p>
										<p className='text-sm text-muted-foreground'>
											{formData.role === 'agent'
												? 'Verify agent to allow listing creation'
												: 'Mark user as verified'}
										</p>
									</div>
								</div>
								<Switch
									checked={formData.isVerified}
									onCheckedChange={(checked: boolean) =>
										setFormData((prev) => ({ ...prev, isVerified: checked }))
									}
								/>
							</div>

							<Separator />

							{/* Danger Zone */}
							<div className='space-y-3'>
								<p className='text-sm font-medium text-destructive'>Danger Zone</p>
								{showDeleteConfirm ? (
									<div className='p-3 rounded-lg border border-destructive/50 bg-destructive/10'>
										<div className='flex items-center gap-2 mb-3'>
											<AlertTriangle className='h-4 w-4 text-destructive' />
											<p className='text-sm font-medium'>
												Are you sure you want to delete this user?
											</p>
										</div>
										<p className='text-sm text-muted-foreground mb-3'>
											This action cannot be undone. All user data will be
											permanently removed.
										</p>
										<div className='flex gap-2'>
											<Button
												type='button'
												variant='destructive'
												size='sm'
												onClick={handleDelete}
												disabled={deleteMutation.isPending}>
												{deleteMutation.isPending ? (
													<Loader2 className='h-4 w-4 mr-1 animate-spin' />
												) : (
													<Trash2 className='h-4 w-4 mr-1' />
												)}
												Delete
											</Button>
											<Button
												type='button'
												variant='outline'
												size='sm'
												onClick={() => setShowDeleteConfirm(false)}>
												Cancel
											</Button>
										</div>
									</div>
								) : (
									<Button
										type='button'
										variant='outline'
										className='text-destructive hover:text-destructive'
										onClick={() => setShowDeleteConfirm(true)}>
										<Trash2 className='h-4 w-4 mr-2' />
										Delete User
									</Button>
								)}
							</div>
						</div>

						{/* Footer */}
						<div className='flex justify-end gap-2 p-4 border-t'>
							<Button type='button' variant='outline' onClick={onClose}>
								Cancel
							</Button>
							<Button type='submit' disabled={updateMutation.isPending}>
								{updateMutation.isPending && (
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								)}
								Save Changes
							</Button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

