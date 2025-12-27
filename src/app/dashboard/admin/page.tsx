'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
	Users,
	FileText,
	CheckCircle,
	XCircle,
	Clock,
	Loader2,
	AlertCircle,
	Building2,
	TrendingUp,
	Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/shared/Skeleton';
import { UsersTable } from '@/components/admin/UsersTable';
import { PaymentProofModal } from '@/components/admin/PaymentProofModal';
import { RejectReasonModal } from '@/components/admin/RejectReasonModal';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { usePlatformStats } from '@/hooks/api/useAdmin';
import {
	usePendingPaymentProofs,
	useApprovePaymentProof,
	useRejectPaymentProof
} from '@/hooks/api/usePayments';
import { formatNaira } from '@/lib/utils/currency';
import { canAccessAdmin } from '@/lib/utils/guards';
import { toast } from 'sonner';
import Link from 'next/link';
import type { PaymentProof } from '@/lib/api/types';

export default function AdminDashboard() {
	// Preview modal state
	const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Rejection modal state
	const [proofToReject, setProofToReject] = useState<PaymentProof | null>(null);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

	// TanStack Query hooks
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { data: statsData, isLoading: isStatsLoading } = usePlatformStats();
	const { data: pendingProofsData, isLoading: isPendingProofsLoading } =
		usePendingPaymentProofs();

	const approveMutation = useApprovePaymentProof();
	const rejectMutation = useRejectPaymentProof();

	const pendingProofs = pendingProofsData?.proofs ?? [];
	// statsData is now PlatformStats directly (not { stats: PlatformStats })
	const stats = statsData;

	const handleOpenProofModal = (proof: PaymentProof) => {
		setSelectedProof(proof);
		setIsModalOpen(true);
	};

	const handleCloseProofModal = () => {
		setIsModalOpen(false);
		setSelectedProof(null);
	};

	const handleApproveProof = (proofId: string) => {
		approveMutation.mutate(proofId, {
			onSuccess: () => {
				toast.success('Payment proof approved');
				handleCloseProofModal();
			},
			onError: (err) => toast.error(err.message || 'Failed to approve proof')
		});
	};

	// Open rejection modal to get custom reason
	const handleOpenRejectModal = (proof: PaymentProof) => {
		setProofToReject(proof);
		setIsRejectModalOpen(true);
		// Close the preview modal if it's open
		handleCloseProofModal();
	};

	const handleCloseRejectModal = () => {
		setIsRejectModalOpen(false);
		setProofToReject(null);
	};

	// Handle actual rejection with custom reason
	const handleConfirmReject = (reason: string) => {
		if (!proofToReject) return;

		rejectMutation.mutate(
			{ proofId: proofToReject.id, reason },
			{
				onSuccess: () => {
					toast.success('Payment proof rejected');
					handleCloseRejectModal();
				},
				onError: (err) => toast.error(err.message || 'Failed to reject proof')
			}
		);
	};

	// Loading state
	if (isUserLoading) {
		return (
			<div className='container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	// Access control
	if (!user || !canAccessAdmin(user.role)) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-md'>
				<Card className='text-center'>
					<CardContent className='py-12'>
						<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
						<p className='text-muted-foreground mb-6'>
							You don&apos;t have permission to access the admin dashboard.
						</p>
						<Button asChild>
							<Link href='/'>Go Home</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

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
				{isStatsLoading ? (
					<>
						{[...Array(4)].map((_, i) => (
							<Card key={i}>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-4 w-4' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-8 w-16 mb-1' />
									<Skeleton className='h-3 w-20' />
								</CardContent>
							</Card>
						))}
					</>
				) : (
					<>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}>
							<Card>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<CardTitle className='text-sm font-medium'>
										Total Users
									</CardTitle>
									<Users className='h-4 w-4 text-muted-foreground' />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{stats?.totalUsers ?? 0}
									</div>
									<p className='text-xs text-muted-foreground'>
										{stats?.usersByRole?.agent ?? 0} agents,{' '}
										{stats?.usersByRole?.student ?? 0} students
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
										Total Listings
									</CardTitle>
									<Building2 className='h-4 w-4 text-muted-foreground' />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{stats?.totalListings ?? 0}
									</div>
									<p className='text-xs text-muted-foreground'>
										{stats?.activeListings ?? 0} active listings
									</p>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}>
							<Card>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<CardTitle className='text-sm font-medium'>
										Pending Proofs
									</CardTitle>
									<Clock className='h-4 w-4 text-muted-foreground' />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{stats?.pendingProofs ?? pendingProofs.length}
									</div>
									<p className='text-xs text-muted-foreground'>
										Awaiting review
									</p>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.3 }}>
							<Card>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<CardTitle className='text-sm font-medium'>
										Total Revenue
									</CardTitle>
									<TrendingUp className='h-4 w-4 text-muted-foreground' />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{formatNaira(stats?.totalRevenue ?? 0)}
									</div>
									<p className='text-xs text-muted-foreground'>
										From approved payments
									</p>
								</CardContent>
							</Card>
						</motion.div>
					</>
				)}
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
								{isPendingProofsLoading ? (
									<div className='space-y-4'>
										{[...Array(3)].map((_, i) => (
											<div
												key={i}
												className='flex items-center space-x-4 p-4 border rounded-lg'>
												<Skeleton className='w-16 h-16 rounded-lg' />
												<div className='flex-1 space-y-2'>
													<Skeleton className='h-5 w-40' />
													<Skeleton className='h-4 w-60' />
													<Skeleton className='h-3 w-32' />
												</div>
												<div className='flex space-x-2'>
													<Skeleton className='h-9 w-24' />
													<Skeleton className='h-9 w-20' />
												</div>
											</div>
										))}
									</div>
								) : pendingProofs.length === 0 ? (
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
												className='flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
												{/* Clickable image thumbnail */}
												<button
													onClick={() => handleOpenProofModal(proof)}
													className='relative w-16 h-16 shrink-0 group cursor-pointer'
													title='Click to view full image'>
													<Image
														src={proof.imageUrl}
														alt='Payment proof'
														fill
														sizes='64px'
														className='rounded-lg object-cover'
													/>
													<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center'>
														<Eye className='h-5 w-5 text-white' />
													</div>
												</button>
												<div className='flex-1 min-w-0'>
													<h4 className='font-semibold'>
														Payment Proof #{proof.id.slice(-6)}
													</h4>
													<p className='text-sm text-muted-foreground'>
														Amount: {formatNaira(proof.amount)} • Method:{' '}
														{proof.method.replace('_', ' ')}
													</p>
													<p className='text-sm text-muted-foreground truncate'>
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
														variant='outline'
														onClick={() => handleOpenProofModal(proof)}>
														<Eye className='h-4 w-4 mr-1' />
														View
													</Button>
													<Button
														size='sm'
														onClick={() => handleApproveProof(proof.id)}
														disabled={
															approveMutation.isPending ||
															rejectMutation.isPending
														}
														className='bg-green-600 hover:bg-green-700'>
														{approveMutation.isPending ? (
															<Loader2 className='h-4 w-4 mr-1 animate-spin' />
														) : (
															<CheckCircle className='h-4 w-4 mr-1' />
														)}
														Approve
													</Button>
													<Button
														size='sm'
														variant='destructive'
														disabled={
															approveMutation.isPending ||
															rejectMutation.isPending
														}
														onClick={() => handleOpenRejectModal(proof)}>
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
									Manage user accounts, roles, and verification status
								</CardDescription>
							</CardHeader>
							<CardContent>
								<UsersTable />
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>

			{/* Payment Proof Preview Modal */}
			<PaymentProofModal
				proof={selectedProof}
				isOpen={isModalOpen}
				onClose={handleCloseProofModal}
				onApprove={handleApproveProof}
				onReject={(proofId) => {
					// Find the proof and open reject modal
					const proof = pendingProofs.find((p) => p.id === proofId);
					if (proof) {
						handleOpenRejectModal(proof);
					}
				}}
				isApproving={approveMutation.isPending}
				isRejecting={false}
			/>

			{/* Rejection Reason Modal */}
			<RejectReasonModal
				isOpen={isRejectModalOpen}
				onClose={handleCloseRejectModal}
				onConfirm={handleConfirmReject}
				isLoading={rejectMutation.isPending}
				proofId={proofToReject?.id}
			/>
		</div>
	);
}
