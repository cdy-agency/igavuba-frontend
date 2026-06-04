'use client';

import { useDashboard } from '@/contexts/dashboard-context';
import { UserRole } from '@/types/enum';
import {
  ContentReviewerDashboard,
  DataManagerDashboard,
  InstitutionAdminDashboard,
  LearnerDashboard,
  LecturerDashboard,
  SuperAdminDashboard,
  SupportAgentDashboard,
} from '@/components/widgets/role-dashboards';

export function DashboardHome() {
  const { role } = useDashboard();

  switch (role) {
    case UserRole.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case UserRole.INSTITUTION_ADMIN:
      return <InstitutionAdminDashboard />;
    case UserRole.LECTURER:
      return <LecturerDashboard />;
    case UserRole.LEARNER:
      return <LearnerDashboard />;
    case UserRole.DATA_MANAGER:
      return <DataManagerDashboard />;
    case UserRole.CONTENT_REVIEWER:
      return <ContentReviewerDashboard />;
    case UserRole.SUPPORT_AGENT:
      return <SupportAgentDashboard />;
    default:
      return (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-8 py-14 text-center shadow-sm">
          <p className="text-xl font-bold text-foreground">Welcome to your dashboard</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your role is not configured yet. Contact an administrator for access.
          </p>
        </div>
      );
  }
}
