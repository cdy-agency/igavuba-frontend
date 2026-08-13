'use client';

import { useRef, useState } from 'react';
import { Building2, Copy, Check, Loader2, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/api/upload';
import { useSubmitPayment } from '@/hooks/use-payments';

const PAYMENT_ACCOUNT_NAME =
  process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || 'CDY MARKETING COMPANY';
const PAYMENT_CODE = process.env.NEXT_PUBLIC_PAYMENT_CODE || '0003636';

interface PaymentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  amount: number | null;
  currency?: string | null;
  onSubmitted?: () => void;
}

export function PaymentUploadDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  amount,
  currency = 'RWF',
  onSubmitted,
}: PaymentUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitPayment = useSubmitPayment();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setReferenceNumber('');
    setSelectedFile(null);
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const proofFile = await uploadFile(selectedFile);
      await submitPayment.mutateAsync({
        courseId,
        proofFile,
        referenceNumber: referenceNumber.trim() || undefined,
      });
      handleClose(false);
      onSubmitted?.();
    } catch {
      // toast handled in hook / upload
    } finally {
      setUploading(false);
    }
  };

  const isBusy = uploading || submitPayment.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Submit proof of payment for <strong>{courseTitle}</strong>
            {amount != null && amount > 0 ? (
              <>
                {' '}
                — {amount.toLocaleString()} {currency ?? 'RWF'}
              </>
            ) : null}
            . Accepted formats: image or PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-primary/20 bg-[var(--primary-subtle)] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Payment details
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Pay to</dt>
                <dd className="text-right font-semibold text-foreground">
                  {PAYMENT_ACCOUNT_NAME}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Payment code</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-mono text-base font-bold tracking-wide text-primary">
                    {PAYMENT_CODE}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => void handleCopyCode()}
                    aria-label="Copy payment code"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </dd>
              </div>
              {amount != null && amount > 0 ? (
                <div className="flex items-start justify-between gap-3 border-t border-primary/15 pt-3">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {amount.toLocaleString()} {currency ?? 'RWF'}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Use this payment code when transferring, then upload your receipt below.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-proof">Payment receipt</Label>
            <Input
              id="payment-proof"
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              disabled={isBusy}
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
              }}
            />
            {selectedFile ? (
              <p className="text-xs text-muted-foreground">{selectedFile.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference-number">Reference number (optional)</Label>
            <Input
              id="reference-number"
              value={referenceNumber}
              disabled={isBusy}
              placeholder="e.g. TXN-123456789"
              onChange={(event) => setReferenceNumber(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isBusy} onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!selectedFile || isBusy} onClick={() => void handleSubmit()}>
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit proof
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
