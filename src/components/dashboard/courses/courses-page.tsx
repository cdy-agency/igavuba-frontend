'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { CourseManagementPage } from '@/components/dashboard/courses/course-management-page';

const COURSE_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export function CoursesPage() {
  return (
    <RoleGuard allowedRoles={COURSE_MANAGER_ROLES}>
      <CourseManagementPage />
    </RoleGuard>
  );
}
