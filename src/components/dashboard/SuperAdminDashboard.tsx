'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { SuperAdminDashboardView } from './home/super-admin-dashboard-view';

interface SuperAdminDashboardProps {
  data: DashboardPayload;
}

export function SuperAdminDashboard({ data }: SuperAdminDashboardProps) {
  return <SuperAdminDashboardView data={data} />;
}
