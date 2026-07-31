'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { RoleDashboardView } from './role-dashboard-view';

interface LecturerDashboardProps {
  data: DashboardPayload;
}

export function LecturerDashboard({ data }: LecturerDashboardProps) {
  return <RoleDashboardView data={data} />;
}
