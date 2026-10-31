'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { LearnerDashboardView } from './home/learner-dashboard-view';

interface LearnerDashboardProps {
  data: DashboardPayload;
}

export function LearnerDashboard({ data }: LearnerDashboardProps) {
  return <LearnerDashboardView data={data} />;
}
