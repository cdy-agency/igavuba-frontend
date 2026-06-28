'use client';

import { RoleGuard } from '@/guards/role-guard';
import { PageHeader } from '@/components/dashboard/page-header';
import { DepartmentsTable } from '@/components/dashboard/departments/departments-table';
import { useDashboard } from '@/contexts/dashboard-context';
import { UserRole } from '@/types/enum';

const DEPARTMENT_VIEWER_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

export function DepartmentsPage() {
  const { role } = useDashboard();
  const isReadOnly = role === UserRole.SUPER_ADMIN;

  return (
    <RoleGuard allowedRoles={DEPARTMENT_VIEWER_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Departments"
          description={
            isReadOnly
              ? 'View academic departments across all institutions.'
              : 'Create and manage departments for lecturers and courses.'
          }
        />
        <DepartmentsTable />
      </div>
    </RoleGuard>
  );
}
