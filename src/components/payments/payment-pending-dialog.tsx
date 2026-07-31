'use client';

import { Clock, Mail, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const PAYMENT_SUPPORT_EMAIL = 'info@cdyagency.com';
const PAYMENT_SUPPORT_PHONE = '+250 790 147 808';

interface PaymentPendingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
}

export function PaymentPendingDialog({
  open,
  onOpenChange,
  courseTitle,
}: PaymentPendingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center">Awaiting payment confirmation</DialogTitle>
          <DialogDescription className="text-center">
            Your payment proof for <strong>{courseTitle}</strong> has been submitted and is being
            reviewed. You will get full course access once your payment is approved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 text-center text-sm text-muted-foreground">
          <p>Need help? Contact support:</p>
          <div className="flex flex-col items-center gap-2">
            <a
              href={`mailto:${PAYMENT_SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              {PAYMENT_SUPPORT_EMAIL}
            </a>
            <a
              href={`tel:${PAYMENT_SUPPORT_PHONE.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              {PAYMENT_SUPPORT_PHONE}
            </a>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
