'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { CourseResultsPage } from '@/components/dashboard/course-results/course-results-page';

const COURSE_RESULTS_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function CourseResultsRoutePage() {
  const params = useParams<{ slug: string }>();

  return (
    <RoleGuard allowedRoles={COURSE_RESULTS_ROLES}>
      <CourseResultsPage courseSlug={params.slug} />
    </RoleGuard>
  );
}
