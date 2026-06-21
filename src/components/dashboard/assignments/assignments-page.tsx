'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { AssignmentManagementPage } from '@/components/dashboard/assignments/assignment-management-page';

const ASSIGNMENT_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export function AssignmentsPage() {
  return (
    <RoleGuard allowedRoles={ASSIGNMENT_MANAGER_ROLES}>
      <AssignmentManagementPage />
    </RoleGuard>
  );
}
