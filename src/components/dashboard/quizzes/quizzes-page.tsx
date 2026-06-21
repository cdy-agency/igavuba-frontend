'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { QuizManagementPage } from '@/components/dashboard/quizzes/quiz-management-page';

const QUIZ_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export function QuizzesPage() {
  return (
    <RoleGuard allowedRoles={QUIZ_MANAGER_ROLES}>
      <QuizManagementPage />
    </RoleGuard>
  );
}
