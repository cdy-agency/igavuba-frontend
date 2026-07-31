'use client';

import Link from 'next/link';
import { Loader2, Play, Upload } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { RoleGuard } from '@/guards/role-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentUploadDialog } from '@/components/payments/payment-upload-dialog';
import { useMyPayments } from '@/hooks/use-payments';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { UserRole } from '@/types/enum';
import type { PaymentRecord, PaymentRecordStatus } from '@/types/payment';
import { cn } from '@/lib/utils';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';
import { useState } from 'react';

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

function StudentPaymentsPanel() {
  const authReady = useAuthReady();
  const { data, isPending, isError } = useMyPayments(authReady);
  const [resubmitPayment, setResubmitPayment] = useState<PaymentRecord | null>(null);

  if (!authReady || isPending) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        Unable to load your payments.
      </div>
    );
  }

  const payments = data ?? [];

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  You have not submitted any payments yet.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment: PaymentRecord) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium">{payment.course.title}</div>
                    {payment.status === 'REJECTED' && payment.rejectionReason ? (
                      <p className="mt-1 text-xs text-destructive">{payment.rejectionReason}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {payment.amount.toLocaleString()} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('font-medium', statusBadgeClass(payment.status))}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {payment.status === 'REJECTED' ? (
                      <DashboardActionGroup className="justify-end">
                        <DashboardActionIconButton
                          label="Resubmit payment"
                          icon={Upload}
                          variant="primary"
                          onClick={() => setResubmitPayment(payment)}
                        />
                      </DashboardActionGroup>
                    ) : payment.status === 'APPROVED' ? (
                      <DashboardActionGroup className="justify-end">
                        <DashboardActionIconButton
                          label="Continue learning"
                          icon={Play}
                          variant="primary"
                          href={`/learn/${payment.course.slug}`}
                        />
                      </DashboardActionGroup>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {resubmitPayment ? (
        <PaymentUploadDialog
          open={Boolean(resubmitPayment)}
          onOpenChange={(open) => {
            if (!open) setResubmitPayment(null);
          }}
          courseId={resubmitPayment.courseId}
          courseTitle={resubmitPayment.course.title}
          amount={resubmitPayment.amount}
          currency={resubmitPayment.currency}
        />
      ) : null}
    </>
  );
}

export function StudentPaymentsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.LEARNER]}>
      <div className="space-y-6">
        <PageHeader
          title="Payments"
          description="Track your course payment submissions and resubmit proof if rejected."
        />
        <StudentPaymentsPanel />
      </div>
    </RoleGuard>
  );
}
