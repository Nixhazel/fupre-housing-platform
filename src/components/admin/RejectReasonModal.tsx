'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RejectReasonModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	isLoading?: boolean;
	proofId?: string;
}

// Preset rejection reasons for quick selection
const PRESET_REASONS = [
	'Payment amount does not match the required amount',
	'Transaction reference is invalid or already used',
	'Payment proof image is unclear or unreadable',
	'Bank transfer details do not match our records',
	'Payment was not received in our account',
	'Duplicate payment submission detected',
	'Payment proof appears to be edited or fraudulent'
];

export function RejectReasonModal({
	isOpen,
	onClose,
	onConfirm,
	isLoading = false,
	proofId
}: RejectReasonModalProps) {
	const [reason, setReason] = useState('');
	const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

	const handlePresetClick = (index: number) => {
		if (selectedPreset === index) {
			// Deselect
			setSelectedPreset(null);
			setReason('');
		} else {
			setSelectedPreset(index);
			setReason(PRESET_REASONS[index]);
		}
	};

	const handleReasonChange = (value: string) => {
		setReason(value);
		// Clear preset selection if user modifies the text
		if (selectedPreset !== null && value !== PRESET_REASONS[selectedPreset]) {
			setSelectedPreset(null);
		}
	};

	const handleConfirm = () => {
		if (reason.trim()) {
			onConfirm(reason.trim());
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setReason('');
			setSelectedPreset(null);
			onClose();
		}
	};

	const isValid = reason.trim().length >= 10;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<XCircle className="h-5 w-5" />
						Reject Payment Proof
					</DialogTitle>
					<DialogDescription>
						{proofId && (
							<span className="block mb-1">
								Proof ID: #{proofId.slice(-6)}
							</span>
						)}
						Please provide a reason for rejecting this payment proof. The user
						will see this reason in their notification.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Preset Reasons */}
					<div className="space-y-2">
						<Label className="text-sm font-medium">Quick Select Reason</Label>
						<div className="flex flex-wrap gap-2">
							{PRESET_REASONS.map((preset, index) => (
								<Button
									key={index}
									type="button"
									variant={selectedPreset === index ? 'default' : 'outline'}
									size="sm"
									className={cn(
										'text-xs h-auto py-1.5 px-2 whitespace-normal text-left',
										selectedPreset === index && 'ring-2 ring-primary'
									)}
									onClick={() => handlePresetClick(index)}
									disabled={isLoading}
								>
									{preset.length > 40 ? preset.slice(0, 40) + '...' : preset}
								</Button>
							))}
						</div>
					</div>

					{/* Custom Reason */}
					<div className="space-y-2">
						<Label htmlFor="rejection-reason" className="text-sm font-medium">
							Rejection Reason
						</Label>
						<Textarea
							id="rejection-reason"
							placeholder="Enter the reason for rejection (minimum 10 characters)..."
							value={reason}
							onChange={(e) => handleReasonChange(e.target.value)}
							className="min-h-[100px] resize-none"
							disabled={isLoading}
						/>
						<p className="text-xs text-muted-foreground">
							{reason.length}/10 characters minimum
							{reason.length >= 10 && (
								<span className="text-green-600 ml-2">✓ Valid</span>
							)}
						</p>
					</div>

					{/* Warning */}
					<div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
						<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
						<p className="text-xs text-amber-700 dark:text-amber-400">
							This action cannot be undone. The user will be notified of the
							rejection and will need to submit a new payment proof.
						</p>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={!isValid || isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Rejecting...
							</>
						) : (
							<>
								<XCircle className="h-4 w-4 mr-2" />
								Reject Payment
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

