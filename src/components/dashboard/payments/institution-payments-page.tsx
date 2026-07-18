'use client';

import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
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
import { useInstitutionPayments } from '@/hooks/use-payments';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { UserRole } from '@/types/enum';
import type { PaymentRecord, PaymentRecordStatus } from '@/types/payment';
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

function InstitutionPaymentsPanel() {
  const authReady = useAuthReady();
  const { data, isPending, isError } = useInstitutionPayments(authReady);

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
        Unable to load payments.
      </div>
    );
  }

  const payments = data ?? [];

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                No payments submitted yet.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment: PaymentRecord) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="font-medium">{payment.student.name}</div>
                  <div className="text-xs text-muted-foreground">{payment.student.email}</div>
                </TableCell>
                <TableCell>{payment.course.title}</TableCell>
                <TableCell>
                  {payment.amount.toLocaleString()} {payment.currency}
                </TableCell>
                <TableCell>{payment.paymentMethod.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge className={cn('font-medium', statusBadgeClass(payment.status))}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DashboardActionGroup className="justify-end">
                    <DashboardActionIconButton
                      label="Review payment"
                      icon={Eye}
                      variant="primary"
                      href={`/dashboard/payments/${payment.id}`}
                    />
                  </DashboardActionGroup>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function InstitutionPaymentsPage() {
  return (
    <RoleGuard allowedRoles={ADMIN_ROLES}>
      <div className="space-y-6">
        <PageHeader
          title="Payments"
          description="Review learner payment proofs and activate course access after approval."
        />
        <InstitutionPaymentsPanel />
      </div>
    </RoleGuard>
  );
}
