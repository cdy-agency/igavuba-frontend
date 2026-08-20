'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { CourseEventsPage } from '@/components/dashboard/courses/course-events-page';
import { useCourseDetail } from '@/hooks/use-courses';
import { UserRole } from '@/types/enum';

const COURSE_EVENT_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER, UserRole.SUPER_ADMIN];

export default function DashboardCourseEventsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const { data: course } = useCourseDetail(slug, Boolean(slug));

  return (
    <RoleGuard allowedRoles={COURSE_EVENT_ROLES}>
      <CourseEventsPage courseSlug={slug} courseTitle={course?.title} courseId={course?.id} />
    </RoleGuard>
  );
}
