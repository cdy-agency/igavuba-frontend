'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { UsersTable } from '@/components/dashboard/users/users-table';
import { useDashboard } from '@/contexts/dashboard-context';
import { PageHeader } from '@/components/dashboard/page-header';

const USERS_VIEWER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.SUPPORT_AGENT,
];

export function UsersPage() {
  const { role } = useDashboard();
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  return (
    <RoleGuard allowedRoles={USERS_VIEWER_ROLES}>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description={
            isSuperAdmin
              ? 'Browse all platform users. Filter by role, learner type, or status.'
              : 'Browse institution staff and learners, including public learners enrolled in your courses.'
          }
        />
        <UsersTable />
      </div>
    </RoleGuard>
  );
}
