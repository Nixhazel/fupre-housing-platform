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
	GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/store/authSlice';
import { useListingsStore } from '@/lib/store/listingsSlice';
import { formatNaira } from '@/lib/utils/currency';
import { dayjs } from '@/lib/utils/date';
import { canAccessAgent } from '@/lib/utils/guards';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AgentProfilePage() {
	const { user, updateUser } = useAuthStore();
	const { getListingsByAgent } = useListingsStore();
	const router = useRouter();

	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		name: '',
		email: '',
		phone: '',
		matricNumber: '',
		bio: '',
		specialties: '',
		experience: ''
	});

	useEffect(() => {
		if (!user || !canAccessAgent(user.role)) {
			router.push('/');
			return;
		}

		setEditForm({
			name: user.name || '',
			email: user.email || '',
			phone: user.phone || '',
			matricNumber: user.matricNumber || '',
			bio: 'Experienced real estate agent specializing in student housing near FUPRE campus.',
			specialties:
				'Student Housing, Campus Area Properties, Budget-Friendly Rentals',
			experience: '3+ years'
		});
	}, [user, router]);

	const handleSave = () => {
		updateUser({
			name: editForm.name,
			email: editForm.email,
			phone: editForm.phone,
			matricNumber: editForm.matricNumber
		});
		setIsEditing(false);
		toast.success('Profile updated successfully!');
	};

	const handleCancel = () => {
		setEditForm({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			matricNumber: user?.matricNumber || '',
			bio: 'Experienced real estate agent specializing in student housing near FUPRE campus.',
			specialties:
				'Student Housing, Campus Area Properties, Budget-Friendly Rentals',
			experience: '3+ years'
		});
		setIsEditing(false);
	};

	if (!user || !canAccessAgent(user.role)) {
		return null;
	}

	const agentListings = getListingsByAgent(user.id);
	const totalEarnings = agentListings.reduce(
		(sum, listing) => sum + listing.views * 100,
		0
	);
	const averageRating =
		agentListings.length > 0
			? agentListings.reduce((sum, listing) => sum + listing.rating, 0) /
			  agentListings.length
			: 0;

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
								<Button variant='outline' onClick={handleCancel}>
									<X className='h-4 w-4 mr-2' />
									Cancel
								</Button>
								<Button onClick={handleSave}>
									<Save className='h-4 w-4 mr-2' />
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
									{user.verified && (
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
									<div className='text-center'>
										<div className='flex items-center justify-center gap-1 mb-1'>
											<Star className='h-4 w-4 text-yellow-500 fill-current' />
											<span className='text-lg font-bold'>
												{averageRating.toFixed(1)}
											</span>
										</div>
										<p className='text-sm text-muted-foreground'>
											Based on {agentListings.length} listings
										</p>
									</div>
									<Separator />
									<div className='grid grid-cols-2 gap-4 text-center'>
										<div>
											<div className='text-lg font-bold'>
												{agentListings.length}
											</div>
											<p className='text-sm text-muted-foreground'>Listings</p>
										</div>
										<div>
											<div className='text-lg font-bold'>
												{formatNaira(totalEarnings)}
											</div>
											<p className='text-sm text-muted-foreground'>Earnings</p>
										</div>
									</div>
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
										{isEditing ? (
											<Input
												id='email'
												type='email'
												value={editForm.email}
												onChange={(e) =>
													setEditForm((prev) => ({
														...prev,
														email: e.target.value
													}))
												}
											/>
										) : (
											<div className='flex items-center gap-2 p-2 rounded-md bg-muted/50'>
												<Mail className='h-4 w-4 text-muted-foreground' />
												<span>{user.email}</span>
											</div>
										)}
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
										{isEditing ? (
											<Input
												id='matricNumber'
												value={editForm.matricNumber}
												onChange={(e) =>
													setEditForm((prev) => ({
														...prev,
														matricNumber: e.target.value
													}))
												}
											/>
										) : (
											<div className='flex items-center gap-2 p-2 rounded-md bg-muted/50'>
												<GraduationCap className='h-4 w-4 text-muted-foreground' />
												<span>{user.matricNumber}</span>
											</div>
										)}
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
