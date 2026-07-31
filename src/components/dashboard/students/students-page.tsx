'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { StudentsTable } from '@/components/dashboard/students/students-table';
import { useDashboard } from '@/contexts/dashboard-context';

const STUDENT_VIEWER_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
  UserRole.DATA_MANAGER,
  UserRole.SUPER_ADMIN,
];

export function StudentsPage() {
  const { role } = useDashboard();
  const isReadOnly = role === UserRole.SUPER_ADMIN || role === UserRole.LECTURER;

  return (
    <RoleGuard allowedRoles={STUDENT_VIEWER_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Students"
          description={
            isReadOnly
              ? 'View internal students and their course progress.'
              : 'Invite students, import rosters, and assign courses without payment.'
          }
        />
        <StudentsTable />
      </div>
    </RoleGuard>
  );
}
