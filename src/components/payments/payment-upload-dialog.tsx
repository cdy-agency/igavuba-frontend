'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
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

interface PaymentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  amount: number | null;
  currency?: string | null;
}

export function PaymentUploadDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  amount,
  currency = 'RWF',
}: PaymentUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitPayment = useSubmitPayment();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setReferenceNumber('');
    setSelectedFile(null);
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
