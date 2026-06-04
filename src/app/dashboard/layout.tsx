'use client';

import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardRouteGuard } from '@/components/dashboard/dashboard-route-guard';

export default function DashboardRootLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      <DashboardRouteGuard>{children}</DashboardRouteGuard>
    </DashboardLayout>
  );
}
