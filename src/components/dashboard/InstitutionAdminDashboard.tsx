'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { RoleDashboardView } from './role-dashboard-view';

interface InstitutionAdminDashboardProps {
  data: DashboardPayload;
}

export function InstitutionAdminDashboard({ data }: InstitutionAdminDashboardProps) {
  return <RoleDashboardView data={data} />;
}
