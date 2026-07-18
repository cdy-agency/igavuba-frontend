'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { RoleGuard } from '@/guards/role-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApprovePayment, usePayment, useRejectPayment } from '@/hooks/use-payments';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { UserRole } from '@/types/enum';
import type { PaymentRecordStatus } from '@/types/payment';
import { cn } from '@/lib/utils';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';

const ADMIN_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusBadgeClass(status: PaymentRecordStatus) {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  }
}

interface PaymentDetailPageProps {
  paymentId: string;
}

function PaymentDetailPanel({ paymentId }: PaymentDetailPageProps) {
  const authReady = useAuthReady();
  const { data: payment, isPending, isError } = usePayment(paymentId, authReady);
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!authReady || isPending) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        Unable to load payment details.
      </div>
    );
  }

  const isPendingReview = payment.status === 'PENDING';
  const isPdf = payment.proofFile.toLowerCase().includes('.pdf');

  return (
    <div className="space-y-6">
      <DashboardActionIconButton
        label="Back to payments"
        icon={ArrowLeft}
        className="-ml-2"
        href="/dashboard/payments"
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Payment details</h2>
            <Badge className={cn('font-medium', statusBadgeClass(payment.status))}>
              {payment.status}
            </Badge>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Student</dt>
              <dd className="mt-1 font-medium">{payment.student.name}</dd>
              <dd className="text-sm text-muted-foreground">{payment.student.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Course</dt>
              <dd className="mt-1 font-medium">{payment.course.title}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Amount</dt>
              <dd className="mt-1 font-medium">
                {payment.amount.toLocaleString()} {payment.currency}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Reference number
              </dt>
              <dd className="mt-1">{payment.referenceNumber || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Submitted date
              </dt>
              <dd className="mt-1">{formatDate(payment.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Method</dt>
              <dd className="mt-1">{payment.paymentMethod.replace('_', ' ')}</dd>
            </div>
          </dl>

          {payment.rejectionReason ? (
            <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              <strong>Rejection reason:</strong> {payment.rejectionReason}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Receipt</h2>
          {isPdf ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">PDF receipt uploaded by the learner.</p>
              <DashboardActionIconButton
                label="Open receipt"
                icon={ExternalLink}
                variant="primary"
                externalHref={payment.proofFile}
              />
            </div>
          ) : (
            <a href={payment.proofFile} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.proofFile}
                alt="Payment receipt"
                className="max-h-[420px] w-full rounded-lg border object-contain"
              />
            </a>
          )}
        </section>
      </div>

      {isPendingReview ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={() => setApproveOpen(true)}>
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Approve payment
          </Button>
          <DashboardActionIconButton
            label="Reject payment"
            icon={XCircle}
            variant="destructive"
            onClick={() => setRejectOpen(true)}
          />
        </div>
      ) : null}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve payment</DialogTitle>
            <DialogDescription>
              This will activate the learner&apos;s enrollment and unlock full course access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={approvePayment.isPending}
              onClick={() => {
                void approvePayment.mutateAsync(payment.id, {
                  onSuccess: () => setApproveOpen(false),
                });
              }}
            >
              {approvePayment.isPending ? 'Approving...' : 'Confirm approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payment</DialogTitle>
            <DialogDescription>
              Provide a reason so the learner can resubmit payment proof.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rejection-reason">Rejection reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Explain why this payment was rejected..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={rejectPayment.isPending || rejectionReason.trim().length < 3}
              onClick={() => {
                void rejectPayment.mutateAsync(
                  {
                    id: payment.id,
                    payload: { rejectionReason: rejectionReason.trim() },
                  },
                  {
                    onSuccess: () => {
                      setRejectOpen(false);
                      setRejectionReason('');
                    },
                  },
                );
              }}
            >
              {rejectPayment.isPending ? 'Rejecting...' : 'Confirm rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PaymentDetailPage({ paymentId }: PaymentDetailPageProps) {
  return (
    <RoleGuard allowedRoles={ADMIN_ROLES}>
      <div className="space-y-6">
        <PageHeader
          title="Payment review"
          description="Review payment proof and approve or reject the submission."
        />
        <PaymentDetailPanel paymentId={paymentId} />
      </div>
    </RoleGuard>
  );
}
