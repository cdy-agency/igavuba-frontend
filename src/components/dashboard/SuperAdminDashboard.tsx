'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { RoleDashboardView } from './role-dashboard-view';

interface SuperAdminDashboardProps {
  data: DashboardPayload;
}

export function SuperAdminDashboard({ data }: SuperAdminDashboardProps) {
  return <RoleDashboardView data={data} />;
}
