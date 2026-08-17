'use client';

import { RoleGuard } from '@/guards/role-guard';
import { PageHeader } from '@/components/dashboard/page-header';
import { EnrollmentsTable } from '@/components/dashboard/enrollments/enrollments-table';
import { useDashboard } from '@/contexts/dashboard-context';
import { UserRole } from '@/types/enum';

const ENROLLMENTS_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.DATA_MANAGER];

export function EnrollmentsPage() {
  const { role } = useDashboard();
  const isAdmin = role === UserRole.INSTITUTION_ADMIN;

  return (
    <RoleGuard allowedRoles={ENROLLMENTS_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Enrollments"
          description={
            isAdmin
              ? 'Invite internal students, import rosters in bulk, and assign courses without payment.'
              : 'View internal students and their course enrollment records.'
          }
        />
        <EnrollmentsTable />
      </div>
    </RoleGuard>
  );
}
