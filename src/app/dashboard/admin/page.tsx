'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/store/authSlice';
import { usePaymentsStore } from '@/lib/store/paymentsSlice';
import { PaymentProof } from '@/types';
import { formatNaira } from '@/lib/utils/currency';
import { canAccessAdmin } from '@/lib/utils/guards';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminDashboard() {
	const { user } = useAuthStore();
	const { paymentProofs, updatePaymentStatus, getPendingProofs } =
		usePaymentsStore();
	const router = useRouter();

	const [pendingProofs, setPendingProofs] = useState<PaymentProof[]>([]);

	useEffect(() => {
		if (!user || !canAccessAdmin(user.role)) {
			router.push('/');
			return;
		}

		const pending = getPendingProofs();
		setPendingProofs(pending);
	}, [user, getPendingProofs, router]);

	const handleApproveProof = async (proofId: string) => {
		try {
			await updatePaymentStatus(proofId, 'approved', user?.id);
			toast.success('Payment proof approved');
			// Refresh pending proofs
			const pending = getPendingProofs();
			setPendingProofs(pending);
		} catch {
			toast.error('Failed to approve proof');
		}
	};

	const handleRejectProof = async (proofId: string) => {
		try {
			await updatePaymentStatus(proofId, 'rejected', user?.id);
			toast.success('Payment proof rejected');
			// Refresh pending proofs
			const pending = getPendingProofs();
			setPendingProofs(pending);
		} catch {
			toast.error('Failed to reject proof');
		}
	};

	if (!user || !canAccessAdmin(user.role)) {
		return null;
	}

	const stats = {
		totalUsers: 150,
		pendingProofs: pendingProofs.length,
		approvedProofs: paymentProofs.filter((p) => p.status === 'approved').length,
		rejectedProofs: paymentProofs.filter((p) => p.status === 'rejected').length
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Admin Dashboard</h1>
				<p className='text-muted-foreground'>
					Manage users, review payment proofs, and oversee platform operations.
				</p>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
							<Users className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.totalUsers}</div>
							<p className='text-xs text-muted-foreground'>
								+12% from last month
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Pending Proofs
							</CardTitle>
							<Clock className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.pendingProofs}</div>
							<p className='text-xs text-muted-foreground'>Awaiting review</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Approved</CardTitle>
							<CheckCircle className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.approvedProofs}</div>
							<p className='text-xs text-muted-foreground'>This month</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.3 }}>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Rejected</CardTitle>
							<XCircle className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.rejectedProofs}</div>
							<p className='text-xs text-muted-foreground'>This month</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Main Content */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.4 }}>
				<Tabs defaultValue='proofs' className='space-y-6'>
					<TabsList>
						<TabsTrigger value='proofs'>Payment Proofs</TabsTrigger>
						<TabsTrigger value='users'>Users</TabsTrigger>
					</TabsList>

					{/* Payment Proofs Tab */}
					<TabsContent value='proofs'>
						<Card>
							<CardHeader>
								<CardTitle>Payment Proof Review</CardTitle>
								<CardDescription>
									Review and approve payment proofs from students
								</CardDescription>
							</CardHeader>
							<CardContent>
								{pendingProofs.length === 0 ? (
									<div className='text-center py-8'>
										<FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
										<h3 className='text-lg font-semibold mb-2'>
											No pending proofs
										</h3>
										<p className='text-muted-foreground'>
											All payment proofs have been reviewed
										</p>
									</div>
								) : (
									<div className='space-y-4'>
										{pendingProofs.map((proof, index) => (
											<motion.div
												key={proof.id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.3, delay: index * 0.1 }}
												className='flex items-center space-x-4 p-4 border rounded-lg'>
												<div className='relative w-16 h-16 flex-shrink-0'>
													<Image
														src={proof.imageUrl}
														alt='Payment proof'
														fill
														sizes="64px"
														className='rounded-lg object-cover'
													/>
												</div>
												<div className='flex-1 min-w-0'>
													<h4 className='font-semibold'>
														Payment Proof #{proof.id.slice(-6)}
													</h4>
													<p className='text-sm text-muted-foreground'>
														Amount: {formatNaira(proof.amount)} • Method:{' '}
														{proof.method}
													</p>
													<p className='text-sm text-muted-foreground'>
														Reference: {proof.reference}
													</p>
													<p className='text-xs text-muted-foreground'>
														Submitted:{' '}
														{new Date(proof.submittedAt).toLocaleDateString()}
													</p>
												</div>
												<div className='flex items-center space-x-2'>
													<Button
														size='sm'
														onClick={() => handleApproveProof(proof.id)}
														className='bg-green-600 hover:bg-green-700'>
														<CheckCircle className='h-4 w-4 mr-1' />
														Approve
													</Button>
													<Button
														size='sm'
														variant='destructive'
														onClick={() => handleRejectProof(proof.id)}>
														<XCircle className='h-4 w-4 mr-1' />
														Reject
													</Button>
												</div>
											</motion.div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Users Tab */}
					<TabsContent value='users'>
						<Card>
							<CardHeader>
								<CardTitle>User Management</CardTitle>
								<CardDescription>
									Manage user accounts and verification status
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-8'>
									<Users className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
									<h3 className='text-lg font-semibold mb-2'>
										User Management
									</h3>
									<p className='text-muted-foreground'>
										User management features will be available in future updates
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>
		</div>
	);
}
