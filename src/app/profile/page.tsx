'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	User,
	Mail,
	Phone,
	Calendar,
	Shield,
	Edit3,
	Save,
	X,
	Building2,
	Heart,
	Unlock,
	Star,
	TrendingUp,
	Users,
	FileText,
	Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUpdateProfile } from '@/hooks/api/useAuth';
import { useSavedListings } from '@/hooks/api/useListings';
import { useMyRoommates } from '@/hooks/api/useRoommates';
import { useMyPaymentProofs } from '@/hooks/api/usePayments';
import { dayjs } from '@/lib/utils/date';
import { toast } from 'sonner';

function ProfileContent() {
	const { user, isLoading: authLoading } = useAuth();
	const updateProfileMutation = useUpdateProfile();

	// Fetch user-specific data
	const { data: savedListingsData } = useSavedListings({ enabled: !!user });
	const { data: roommatesData } = useMyRoommates({}, { enabled: !!user });
	const { data: paymentsData } = useMyPaymentProofs({}, { enabled: !!user });

	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		name: user?.name || '',
		phone: user?.phone || ''
	});

	if (authLoading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	if (!user) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold mb-4'>Not Authenticated</h1>
					<p className='text-muted-foreground mb-6'>
						Please log in to view your profile.
					</p>
					<Button onClick={() => (window.location.href = '/auth/login')}>
						Go to Login
					</Button>
				</div>
			</div>
		);
	}

	const handleEdit = () => {
		setEditForm({
			name: user.name,
			phone: user.phone || ''
		});
		setIsEditing(true);
	};

	const handleSave = () => {
		updateProfileMutation.mutate(editForm, {
			onSuccess: () => {
				setIsEditing(false);
				toast.success('Profile updated successfully!');
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to update profile');
			}
		});
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditForm({
			name: user.name,
			phone: user.phone || ''
		});
	};

	// Calculate stats based on role
	const savedListings = savedListingsData?.listings || [];
	const roommateListings = roommatesData?.listings || [];
	const paymentProofs = paymentsData?.proofs || [];

	const getRoleStats = () => {
		switch (user.role) {
			case 'agent':
				return [
					{
						label: 'Active Listings',
						value: 0, // Would come from agent listings API
						icon: Building2,
						color: 'text-blue-600'
					},
					{
						label: 'Total Views',
						value: 0,
						icon: TrendingUp,
						color: 'text-green-600'
					},
					{
						label: 'Average Rating',
						value: '0.0',
						icon: Star,
						color: 'text-yellow-600'
					}
				];
			case 'student':
				return [
					{
						label: 'Saved Listings',
						value: savedListings.length,
						icon: Heart,
						color: 'text-red-600'
					},
					{
						label: 'Unlocked Listings',
						value: user.unlockedListingIds.length,
						icon: Unlock,
						color: 'text-green-600'
					},
					{
						label: 'Payment Proofs',
						value: paymentProofs.length,
						icon: FileText,
						color: 'text-blue-600'
					}
				];
			case 'owner':
				return [
					{
						label: 'Roommate Listings',
						value: roommateListings.length,
						icon: Users,
						color: 'text-purple-600'
					},
					{
						label: 'Total Listings',
						value: roommateListings.length,
						icon: TrendingUp,
						color: 'text-green-600'
					},
					{
						label: 'Recent Listings',
						value: roommateListings.filter((l) =>
							dayjs(l.createdAt).isAfter(dayjs().subtract(30, 'days'))
						).length,
						icon: Building2,
						color: 'text-blue-600'
					}
				];
			default:
				return [];
		}
	};

	const roleStats = getRoleStats();

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8'>
					<h1 className='text-3xl font-bold mb-2'>Profile</h1>
					<p className='text-muted-foreground'>
						Manage your account information and view your activity.
					</p>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Profile Information */}
					<div className='lg:col-span-2 space-y-6'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between'>
								<CardTitle className='flex items-center gap-2'>
									<User className='h-5 w-5' />
									Personal Information
								</CardTitle>
								{!isEditing ? (
									<Button variant='outline' size='sm' onClick={handleEdit}>
										<Edit3 className='h-4 w-4 mr-2' />
										Edit
									</Button>
								) : (
									<div className='flex gap-2'>
										<Button variant='outline' size='sm' onClick={handleCancel}>
											<X className='h-4 w-4 mr-2' />
											Cancel
										</Button>
										<Button
											size='sm'
											onClick={handleSave}
											disabled={updateProfileMutation.isPending}>
											{updateProfileMutation.isPending ? (
												<Loader2 className='h-4 w-4 mr-2 animate-spin' />
											) : (
												<Save className='h-4 w-4 mr-2' />
											)}
											Save
										</Button>
									</div>
								)}
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Avatar */}
								<div className='flex items-center gap-4'>
									<Avatar className='h-20 w-20'>
										<AvatarImage src={user.avatarUrl} alt={user.name} />
										<AvatarFallback className='text-lg'>
											{user.name
												.split(' ')
												.map((n) => n[0])
												.join('')}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className='text-xl font-semibold'>{user.name}</h3>
										<div className='flex items-center gap-2 mt-1'>
											<Badge variant={user.isVerified ? 'default' : 'secondary'}>
												{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
											</Badge>
											{user.isVerified && (
												<Badge
													variant='outline'
													className='text-green-600 border-green-600'>
													<Shield className='h-3 w-3 mr-1' />
													Verified
												</Badge>
											)}
										</div>
									</div>
								</div>

								<Separator />

								{/* Form Fields */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
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
											<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
												<User className='h-4 w-4 text-muted-foreground' />
												<span>{user.name}</span>
											</div>
										)}
									</div>

									<div className='space-y-2'>
										<Label htmlFor='email'>Email</Label>
										<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
											<Mail className='h-4 w-4 text-muted-foreground' />
											<span>{user.email || 'Not provided'}</span>
										</div>
									</div>

									<div className='space-y-2'>
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
											<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
												<Phone className='h-4 w-4 text-muted-foreground' />
												<span>{user.phone || 'Not provided'}</span>
											</div>
										)}
									</div>

									<div className='space-y-2'>
										<Label htmlFor='matricNumber'>Matric Number</Label>
										<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
											<FileText className='h-4 w-4 text-muted-foreground' />
											<span>{user.matricNumber || 'Not provided'}</span>
										</div>
									</div>
								</div>

								<div className='space-y-2'>
									<Label>Member Since</Label>
									<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<span>{dayjs(user.createdAt).format('MMMM D, YYYY')}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Stats Sidebar */}
					<div className='space-y-6'>
						{/* Role Stats */}
						<Card>
							<CardHeader>
								<CardTitle>Your Stats</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								{roleStats.map((stat, index) => (
									<motion.div
										key={stat.label}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
										<div className='flex items-center gap-3'>
											<stat.icon className={`h-5 w-5 ${stat.color}`} />
											<span className='font-medium'>{stat.label}</span>
										</div>
										<span className='text-lg font-bold'>{stat.value}</span>
									</motion.div>
								))}
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								{user.role === 'agent' && (
									<Button className='w-full' variant='outline'>
										<Building2 className='h-4 w-4 mr-2' />
										Create New Listing
									</Button>
								)}
								{(user.role === 'owner' || user.role === 'student') && (
									<Button className='w-full' variant='outline' asChild>
										<Link href='/roommates/new'>
											<Users className='h-4 w-4 mr-2' />
											Create Roommate Listing
										</Link>
									</Button>
								)}
								<Button className='w-full' variant='outline' asChild>
									<Link href='/listings?saved=true'>
										<Heart className='h-4 w-4 mr-2' />
										View Saved Listings
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return <ProfileContent />;
}
