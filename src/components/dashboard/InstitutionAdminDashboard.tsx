'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { InstitutionAdminDashboardView } from './home/institution-admin-dashboard-view';

interface InstitutionAdminDashboardProps {
  data: DashboardPayload;
}

export function InstitutionAdminDashboard({ data }: InstitutionAdminDashboardProps) {
  return <InstitutionAdminDashboardView data={data} />;
}
