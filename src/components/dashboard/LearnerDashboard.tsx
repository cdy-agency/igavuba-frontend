'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { RoleDashboardView } from './role-dashboard-view';

interface LearnerDashboardProps {
  data: DashboardPayload;
}

export function LearnerDashboard({ data }: LearnerDashboardProps) {
  return <RoleDashboardView data={data} />;
}
