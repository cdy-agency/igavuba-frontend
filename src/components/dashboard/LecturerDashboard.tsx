'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { LecturerDashboardView } from './home/lecturer-dashboard-view';

interface LecturerDashboardProps {
  data: DashboardPayload;
}

export function LecturerDashboard({ data }: LecturerDashboardProps) {
  return <LecturerDashboardView data={data} />;
}
