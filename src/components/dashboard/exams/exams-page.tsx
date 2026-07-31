'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { ExamManagementPage } from '@/components/dashboard/exams/exam-management-page';

const EXAM_MANAGER_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export function ExamsPage() {
  return (
    <RoleGuard allowedRoles={EXAM_MANAGER_ROLES}>
      <ExamManagementPage />
    </RoleGuard>
  );
}
