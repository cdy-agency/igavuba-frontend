'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { CourseStudentsPage } from '@/components/dashboard/courses/course-students-page';
import { useCourseDetail } from '@/hooks/use-courses';
import { UserRole } from '@/types/enum';

const COURSE_STUDENT_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
  UserRole.SUPER_ADMIN,
];

export default function DashboardCourseStudentsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const { data: course } = useCourseDetail(slug, Boolean(slug));

  return (
    <RoleGuard allowedRoles={COURSE_STUDENT_ROLES}>
      <CourseStudentsPage courseSlug={slug} courseTitle={course?.title} />
    </RoleGuard>
  );
}
