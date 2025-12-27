'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	CheckCircle,
	XCircle,
	Download,
	ZoomIn,
	ZoomOut,
	ExternalLink,
	Loader2,
	Calendar,
	CreditCard,
	Hash,
	User,
	Building2
} from 'lucide-react';
import { formatNaira } from '@/lib/utils/currency';
import { dayjs } from '@/lib/utils/date';
import type { PaymentProof } from '@/lib/api/types';

interface PaymentProofModalProps {
	proof: PaymentProof | null;
	isOpen: boolean;
	onClose: () => void;
	onApprove: (proofId: string) => void;
	onReject: (proofId: string) => void;
	isApproving?: boolean;
	isRejecting?: boolean;
}

export function PaymentProofModal({
	proof,
	isOpen,
	onClose,
	onApprove,
	onReject,
	isApproving = false,
	isRejecting = false
}: PaymentProofModalProps) {
	const [zoom, setZoom] = useState(1);
	const [isDownloading, setIsDownloading] = useState(false);

	if (!proof) return null;

	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev + 0.25, 3));
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev - 0.25, 0.5));
	};

	const handleResetZoom = () => {
		setZoom(1);
	};

	const handleOpenInNewTab = () => {
		window.open(proof.imageUrl, '_blank');
	};

	const handleDownload = async () => {
		setIsDownloading(true);
		try {
			const response = await fetch(proof.imageUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `payment-proof-${proof.id.slice(-6)}.${
				blob.type.split('/')[1] || 'jpg'
			}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download failed:', error);
			// Fallback: open in new tab
			window.open(proof.imageUrl, '_blank');
		} finally {
			setIsDownloading(false);
		}
	};

	const isActionPending = isApproving || isRejecting;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='w-[95vw] max-w-[900px] lg:max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6'>
				<DialogHeader className='pb-2'>
					<DialogTitle className='flex items-center gap-2'>
						<CreditCard className='h-5 w-5' />
						Payment Proof #{proof.id.slice(-6)}
					</DialogTitle>
					<DialogDescription>
						Review the payment proof details before approving or rejecting
					</DialogDescription>
				</DialogHeader>

				<div className='flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 overflow-hidden min-h-0'>
					{/* Image Preview Section - takes more space on desktop */}
					<div className='flex-1 lg:flex-2 flex flex-col min-h-0 min-w-0'>
						{/* Zoom Controls */}
						<div className='flex items-center justify-between mb-3 px-1 flex-wrap gap-2'>
							<div className='flex items-center gap-1 sm:gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={handleZoomOut}
									disabled={zoom <= 0.5}
									className='h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3'>
									<ZoomOut className='h-4 w-4' />
								</Button>
								<span className='text-sm text-muted-foreground min-w-12 sm:min-w-16 text-center'>
									{Math.round(zoom * 100)}%
								</span>
								<Button
									variant='outline'
									size='sm'
									onClick={handleZoomIn}
									disabled={zoom >= 3}
									className='h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3'>
									<ZoomIn className='h-4 w-4' />
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleResetZoom}
									className='text-xs hidden sm:inline-flex'>
									Reset
								</Button>
							</div>
							<div className='flex items-center gap-1 sm:gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={handleOpenInNewTab}
									className='h-8 px-2 sm:h-9 sm:px-3'>
									<ExternalLink className='h-4 w-4 sm:mr-1' />
									<span className='hidden sm:inline'>Open</span>
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={handleDownload}
									disabled={isDownloading}
									className='h-8 px-2 sm:h-9 sm:px-3'>
									{isDownloading ? (
										<Loader2 className='h-4 w-4 animate-spin' />
									) : (
										<>
											<Download className='h-4 w-4 sm:mr-1' />
											<span className='hidden sm:inline'>Download</span>
										</>
									)}
								</Button>
							</div>
						</div>

						{/* Image Container */}
						<div className='flex-1 overflow-auto bg-muted/30 rounded-lg border min-h-[250px] lg:min-h-[400px]'>
							<div
								className='min-h-full flex items-center justify-center p-4'
								style={{ cursor: zoom > 1 ? 'move' : 'default' }}>
								<div
									className='relative transition-transform duration-200'
									style={{ transform: `scale(${zoom})` }}>
									<Image
										src={proof.imageUrl}
										alt='Payment proof'
										width={600}
										height={800}
										className='rounded-lg shadow-lg object-contain max-h-[40vh] lg:max-h-[55vh]'
										style={{ width: 'auto', height: 'auto' }}
										priority
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Details Section - fixed width on desktop, full width on mobile */}
					<div className='w-full lg:w-80 lg:shrink-0 space-y-4 overflow-y-auto'>
						<div className='space-y-3'>
							<h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide'>
								Payment Details
							</h3>

							<div className='space-y-3'>
								<div className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'>
									<CreditCard className='h-4 w-4 mt-0.5 text-muted-foreground' />
									<div>
										<p className='text-xs text-muted-foreground'>Amount</p>
										<p className='font-semibold text-lg'>
											{formatNaira(proof.amount)}
										</p>
									</div>
								</div>

								<div className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'>
									<Hash className='h-4 w-4 mt-0.5 text-muted-foreground' />
									<div>
										<p className='text-xs text-muted-foreground'>Reference</p>
										<p className='font-medium break-all'>{proof.reference}</p>
									</div>
								</div>

								<div className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'>
									<Building2 className='h-4 w-4 mt-0.5 text-muted-foreground' />
									<div>
										<p className='text-xs text-muted-foreground'>
											Payment Method
										</p>
										<p className='font-medium capitalize'>
											{proof.method.replace('_', ' ')}
										</p>
									</div>
								</div>

								<div className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'>
									<Calendar className='h-4 w-4 mt-0.5 text-muted-foreground' />
									<div>
										<p className='text-xs text-muted-foreground'>Submitted</p>
										<p className='font-medium'>
											{dayjs(proof.submittedAt).format('MMM D, YYYY')}
										</p>
										<p className='text-xs text-muted-foreground'>
											{dayjs(proof.submittedAt).format('h:mm A')}
										</p>
									</div>
								</div>

								{/* User info if available */}
								{(proof as PaymentProofWithUser).user && (
									<div className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'>
										<User className='h-4 w-4 mt-0.5 text-muted-foreground' />
										<div>
											<p className='text-xs text-muted-foreground'>
												Submitted By
											</p>
											<p className='font-medium'>
												{(proof as PaymentProofWithUser).user?.name}
											</p>
											<p className='text-xs text-muted-foreground'>
												{(proof as PaymentProofWithUser).user?.email}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Action Buttons */}
						<div className='pt-4 border-t space-y-2'>
							<Button
								className='w-full bg-green-600 hover:bg-green-700'
								onClick={() => onApprove(proof.id)}
								disabled={isActionPending}>
								{isApproving ? (
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								) : (
									<CheckCircle className='h-4 w-4 mr-2' />
								)}
								Approve Payment
							</Button>
							<Button
								variant='destructive'
								className='w-full'
								onClick={() => onReject(proof.id)}
								disabled={isActionPending}>
								{isRejecting ? (
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								) : (
									<XCircle className='h-4 w-4 mr-2' />
								)}
								Reject Payment
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Extended type for populated user data
interface PaymentProofWithUser extends PaymentProof {
	user?: {
		name: string;
		email: string;
		phone?: string;
	};
}
