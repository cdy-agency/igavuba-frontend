'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { CourseFormShell } from '@/components/dashboard/courses/course-form-shell';
import { CourseSettingsPage } from '@/components/dashboard/courses/course-settings-page';
import { UserRole } from '@/types/enum';

const COURSE_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function DashboardCourseSettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';

  return (
    <RoleGuard allowedRoles={COURSE_MANAGER_ROLES}>
      <CourseFormShell mode="edit">
        <CourseSettingsPage courseSlug={slug} />
      </CourseFormShell>
    </RoleGuard>
  );
}
