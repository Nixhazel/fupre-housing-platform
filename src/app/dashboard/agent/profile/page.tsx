'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	User,
	Mail,
	Phone,
	Shield,
	Building2,
	Star,
	Edit,
	Save,
	X,
	GraduationCap,
	Loader2,
	AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/shared/Skeleton';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAgentStats } from '@/hooks/api/useAgent';
import { useUpdateProfile } from '@/hooks/api/useAuth';
import { formatNaira } from '@/lib/utils/currency';
import { dayjs } from '@/lib/utils/date';
import { canAccessAgent } from '@/lib/utils/guards';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AgentProfilePage() {
	const { user, isLoading: authLoading } = useAuth();

	// TanStack Query hooks
	const { data: statsData, isLoading: statsLoading } = useAgentStats({
		enabled: !!user && canAccessAgent(user?.role || '')
	});
	const updateProfileMutation = useUpdateProfile();

	const stats = statsData?.stats;

	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		name: '',
		phone: '',
		bio: '',
		specialties: '',
		experience: ''
	});

	useEffect(() => {
		if (user) {
			setEditForm({
				name: user.name || '',
				phone: user.phone || '',
				bio: 'Experienced real estate agent specializing in student housing near campus.',
				specialties:
					'Student Housing, Campus Area Properties, Budget-Friendly Rentals',
				experience: '3+ years'
			});
		}
	}, [user]);

	const handleSave = () => {
		updateProfileMutation.mutate(
			{
				name: editForm.name,
				phone: editForm.phone
			},
			{
				onSuccess: () => {
					setIsEditing(false);
					toast.success('Profile updated successfully!');
				},
				onError: (err) => {
					toast.error(err.message || 'Failed to update profile');
				}
			}
		);
	};

	const handleCancel = () => {
		setEditForm({
			name: user?.name || '',
			phone: user?.phone || '',
			bio: 'Experienced real estate agent specializing in student housing near campus.',
			specialties:
				'Student Housing, Campus Area Properties, Budget-Friendly Rentals',
			experience: '3+ years'
		});
		setIsEditing(false);
	};

	// Loading state
	if (authLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	// Access control
	if (!user || !canAccessAgent(user.role)) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
						<p className='text-muted-foreground mb-6'>
							You don&apos;t have permission to access this page.
						</p>
						<Button asChild>
							<Link href='/'>Go Home</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isUpdating = updateProfileMutation.isPending;

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>Agent Profile</h1>
						<p className='text-muted-foreground'>
							Manage your profile and showcase your expertise
						</p>
					</div>
					<div className='flex gap-2'>
						{isEditing ? (
							<>
								<Button variant='outline' onClick={handleCancel} disabled={isUpdating}>
									<X className='h-4 w-4 mr-2' />
									Cancel
								</Button>
								<Button onClick={handleSave} disabled={isUpdating}>
									{isUpdating ? (
										<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									) : (
										<Save className='h-4 w-4 mr-2' />
									)}
									Save Changes
								</Button>
							</>
						) : (
							<Button onClick={() => setIsEditing(true)}>
								<Edit className='h-4 w-4 mr-2' />
								Edit Profile
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Profile Card */}
				<div className='lg:col-span-1'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}>
						<Card>
							<CardHeader className='text-center'>
								<div className='flex justify-center mb-4'>
									<Avatar className='h-24 w-24 border-4 border-primary'>
										<AvatarImage src={user.avatarUrl} alt={user.name} />
										<AvatarFallback className='text-lg'>
											{user.name
												.split(' ')
												.map((n) => n[0])
												.join('')}
										</AvatarFallback>
									</Avatar>
								</div>
								<CardTitle className='text-xl'>{user.name}</CardTitle>
								<div className='flex items-center justify-center gap-2 mb-2'>
									<Badge className='capitalize'>{user.role}</Badge>
									{user.isVerified && (
										<Badge
											variant='outline'
											className='text-green-600 border-green-600'>
											<Shield className='h-3 w-3 mr-1' />
											Verified
										</Badge>
									)}
								</div>
								<p className='text-sm text-muted-foreground'>
									Member since {dayjs(user.createdAt).format('MMM YYYY')}
								</p>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{statsLoading ? (
										<>
											<div className='text-center'>
												<Skeleton className='h-6 w-16 mx-auto mb-1' />
												<Skeleton className='h-4 w-24 mx-auto' />
											</div>
											<Separator />
											<div className='grid grid-cols-2 gap-4 text-center'>
												<div>
													<Skeleton className='h-6 w-10 mx-auto mb-1' />
													<Skeleton className='h-4 w-14 mx-auto' />
												</div>
												<div>
													<Skeleton className='h-6 w-16 mx-auto mb-1' />
													<Skeleton className='h-4 w-14 mx-auto' />
												</div>
											</div>
										</>
									) : (
										<>
											<div className='text-center'>
												<div className='flex items-center justify-center gap-1 mb-1'>
													<Star className='h-4 w-4 text-yellow-500 fill-current' />
													<span className='text-lg font-bold'>
														{stats?.totalListings ?? 0}
													</span>
												</div>
												<p className='text-sm text-muted-foreground'>
													Active listings: {stats?.activeListings ?? 0}
												</p>
											</div>
											<Separator />
											<div className='grid grid-cols-2 gap-4 text-center'>
												<div>
													<div className='text-lg font-bold'>
														{stats?.totalListings ?? 0}
													</div>
													<p className='text-sm text-muted-foreground'>Listings</p>
												</div>
												<div>
													<div className='text-lg font-bold'>
														{formatNaira(stats?.totalEarnings ?? 0)}
													</div>
													<p className='text-sm text-muted-foreground'>Earnings</p>
												</div>
											</div>
										</>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Profile Details */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Personal Information */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<User className='h-5 w-5' />
									Personal Information
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<Label htmlFor='name'>Full Name</Label>
										{isEditing ? (
											<Input
												id='name'
												value={editForm.name}
												onChange={(e) =>
													setEditForm((prev) => ({
														...prev,
														name: e.target.value
													}))
												}
											/>
										) : (
											<div className='flex items-center gap-2 p-2 rounded-md bg-muted/50'>
												<User className='h-4 w-4 text-muted-foreground' />
												<span>{user.name}</span>
											</div>
										)}
									</div>
									<div>
										<Label htmlFor='email'>Email</Label>
										<div className='flex items-center gap-2 p-2 rounded-md bg-muted/50'>
											<Mail className='h-4 w-4 text-muted-foreground' />
											<span>{user.email}</span>
										</div>
									</div>
									<div>
										<Label htmlFor='phone'>Phone</Label>
										{isEditing ? (
											<Input
												id='phone'
												value={editForm.phone}
												onChange={(e) =>
													setEditForm((prev) => ({
														...prev,
														phone: e.target.value
													}))
												}
											/>
										) : (
											<div className='flex items-center gap-2 p-2 rounded-md bg-muted/50'>
												<Phone className='h-4 w-4 text-muted-foreground' />
												<span>{user.phone}</span>
											</div>
										)}
									</div>
									<div>
										<Label htmlFor='matricNumber'>Matric Number</Label>
										<div className='flex items-center gap-2 p-2 rounded-md bg-muted/50'>
											<GraduationCap className='h-4 w-4 text-muted-foreground' />
											<span>{user.matricNumber || 'Not provided'}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Professional Information */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Building2 className='h-5 w-5' />
									Professional Information
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<Label htmlFor='bio'>Bio</Label>
									{isEditing ? (
										<Textarea
											id='bio'
											value={editForm.bio}
											onChange={(e) =>
												setEditForm((prev) => ({
													...prev,
													bio: e.target.value
												}))
											}
											rows={3}
										/>
									) : (
										<p className='p-2 rounded-md bg-muted/50 text-sm'>
											{editForm.bio}
										</p>
									)}
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<Label htmlFor='specialties'>Specialties</Label>
										{isEditing ? (
											<Input
												id='specialties'
												value={editForm.specialties}
												onChange={(e) =>
													setEditForm((prev) => ({
														...prev,
														specialties: e.target.value
													}))
												}
											/>
										) : (
											<p className='p-2 rounded-md bg-muted/50 text-sm'>
												{editForm.specialties}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor='experience'>Experience</Label>
										{isEditing ? (
											<Input
												id='experience'
												value={editForm.experience}
												onChange={(e) =>
													setEditForm((prev) => ({
														...prev,
														experience: e.target.value
													}))
												}
											/>
										) : (
											<p className='p-2 rounded-md bg-muted/50 text-sm'>
												{editForm.experience}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Verification Status */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Shield className='h-5 w-5' />
									Verification Status
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-3'>
									<div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<Shield className='h-5 w-5 text-green-600' />
											<span className='font-medium'>Email Verified</span>
										</div>
										<Badge
											variant='outline'
											className='text-green-600 border-green-600'>
											Verified
										</Badge>
									</div>
									<div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<GraduationCap className='h-5 w-5 text-green-600' />
											<span className='font-medium'>Student ID Verified</span>
										</div>
										<Badge
											variant='outline'
											className='text-green-600 border-green-600'>
											Verified
										</Badge>
									</div>
									<div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<Building2 className='h-5 w-5 text-green-600' />
											<span className='font-medium'>Agent Status</span>
										</div>
										<Badge
											variant='outline'
											className='text-green-600 border-green-600'>
											Active
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
