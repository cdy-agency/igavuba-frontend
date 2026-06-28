'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { LecturersTable } from '@/components/dashboard/lecturers/lecturers-table';
import { useDashboard } from '@/contexts/dashboard-context';

const LECTURER_MANAGER_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

export function LecturersPage() {
  const { role } = useDashboard();
  const isReadOnly = role === UserRole.SUPER_ADMIN;

  return (
    <RoleGuard allowedRoles={LECTURER_MANAGER_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Lecturers"
          description={
            isReadOnly
              ? 'View lecturers across all institutions.'
              : 'Invite lecturers, manage access, and review teaching activity.'
          }
        />
        <LecturersTable />
      </div>
    </RoleGuard>
  );
}
