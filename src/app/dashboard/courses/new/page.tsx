'use client';

import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { CourseForm } from '@/components/dashboard/courses/course-form';
import { CourseFormShell } from '@/components/dashboard/courses/course-form-shell';

const COURSE_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function CreateCoursePage() {
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={COURSE_MANAGER_ROLES}>
      <CourseFormShell mode="create">
        <CourseForm
          mode="create"
          onCancel={() => router.push('/dashboard/courses')}
          onSuccess={() => router.push('/dashboard/courses')}
        />
      </CourseFormShell>
    </RoleGuard>
  );
}
