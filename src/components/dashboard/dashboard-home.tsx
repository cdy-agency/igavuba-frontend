'use client';

import { useRoleDashboard } from '@/hooks/use-role-dashboard';
import { UserRole } from '@/types/enum';
import { InstitutionAdminDashboard } from '@/components/dashboard/InstitutionAdminDashboard';
import { LearnerDashboard } from '@/components/dashboard/LearnerDashboard';
import { LecturerDashboard } from '@/components/dashboard/LecturerDashboard';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { RoleDashboardView } from '@/components/dashboard/role-dashboard-view';
import { EmptyState } from '@/components/dashboard/shared/empty-state';
import { OazisDashboardSkeleton } from '@/components/dashboard/shared/oazis-dashboard-skeleton';
import {
  ContentReviewerDashboard,
  DataManagerDashboard,
  SupportAgentDashboard,
} from '@/components/widgets/role-dashboards';

export function DashboardHome() {
  const { data, isLoading, isError } = useRoleDashboard();

  if (isLoading) {
    return <OazisDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Unable to load dashboard."
        description="Please refresh the page or try again later."
      />
    );
  }

  switch (data.role) {
    case UserRole.SUPER_ADMIN:
      return <SuperAdminDashboard data={data} />;
    case UserRole.INSTITUTION_ADMIN:
      return <InstitutionAdminDashboard data={data} />;
    case UserRole.LECTURER:
      return <LecturerDashboard data={data} />;
    case UserRole.LEARNER:
      return <LearnerDashboard data={data} />;
    case UserRole.CONTENT_REVIEWER:
      return data.cards.length > 0 ? (
        <RoleDashboardView data={data} />
      ) : (
        <ContentReviewerDashboard />
      );
    case UserRole.DATA_MANAGER:
      return data.cards.length > 0 ? (
        <RoleDashboardView data={data} />
      ) : (
        <DataManagerDashboard />
      );
    case UserRole.SUPPORT_AGENT:
      return data.cards.length > 0 ? (
        <RoleDashboardView data={data} />
      ) : (
        <SupportAgentDashboard />
      );
    default:
      return (
        <EmptyState
          title="Welcome to your dashboard"
          description="Your role is not configured yet. Contact an administrator for access."
        />
      );
  }
}
