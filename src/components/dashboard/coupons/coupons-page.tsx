'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Plus, Tag } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import {
  ModernStatusBadge,
  ModernTableShell,
} from '@/components/dashboard/shared/modern-table';
import { CouponFormModal } from '@/components/dashboard/coupons/coupon-form-modal';
import {
  useActivateCoupon,
  useCouponsList,
  useDeactivateCoupon,
  useDeleteCoupon,
} from '@/hooks/use-coupons';
import { UserRole } from '@/types/enum';
import type { CouponRecord } from '@/types/coupon';

const COUPON_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

function statusTone(status: CouponRecord['status']) {
  if (status === 'ACTIVE') return 'success' as const;
  if (status === 'EXPIRED') return 'danger' as const;
  if (status === 'NOT_STARTED') return 'warning' as const;
  return 'neutral' as const;
}

function discountLabel(coupon: CouponRecord) {
  return coupon.discountType === 'PERCENTAGE'
    ? `${coupon.discountValue}%`
    : `${coupon.discountValue.toLocaleString()} off`;
}

export function CouponsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useCouponsList({ page: 1, limit: 50 });
  const activateCoupon = useActivateCoupon();
  const deactivateCoupon = useDeactivateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const coupons = useMemo(() => data?.data ?? [], [data?.data]);

  return (
    <RoleGuard allowedRoles={COUPON_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Coupons"
          description="Create institution discount codes for selected paid courses."
          actions={
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New coupon
            </Button>
          }
        />

        <ModernTableShell>
          {isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
              <Tag className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No coupons yet. Create one for your courses.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Courses</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Valid</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon: CouponRecord) => (
                    <tr key={coupon.id} className="border-b border-border/40">
                      <td className="px-4 py-4 font-semibold">{coupon.code}</td>
                      <td className="px-4 py-4">{discountLabel(coupon)}</td>
                      <td className="px-4 py-4">{coupon.courses.length} course(s)</td>
                      <td className="px-4 py-4">
                        <ModernStatusBadge label={coupon.status} tone={statusTone(coupon.status)} />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {coupon.startsAt ? format(new Date(coupon.startsAt), 'MMM d, yyyy') : '—'}
                        {' → '}
                        {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-4">
                        {coupon.totalUsed}
                        {coupon.maxTotalUses != null ? ` / ${coupon.maxTotalUses}` : ''}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {coupon.isActive ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={deactivateCoupon.isPending}
                              onClick={() => deactivateCoupon.mutate(coupon.id)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={activateCoupon.isPending}
                              onClick={() => activateCoupon.mutate(coupon.id)}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={deleteCoupon.isPending}
                            onClick={() => deleteCoupon.mutate(coupon.id)}
                          >
                            Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModernTableShell>

        <CouponFormModal open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    </RoleGuard>
  );
}
