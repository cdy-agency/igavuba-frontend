'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { CourseForm } from '@/components/dashboard/courses/course-form';
import { CourseFormShell } from '@/components/dashboard/courses/course-form-shell';
import { CourseOwnerSection } from '@/components/dashboard/courses/course-owner-section';
import { CourseSubNav } from '@/components/dashboard/courses/course-sub-nav';
import { useDashboard } from '@/contexts/dashboard-context';
import { useCourseDetail } from '@/hooks/use-courses';
import { getApiErrorMessage } from '@/lib/auth';
import { canEditCourse } from '@/components/dashboard/courses/course-owner-section';
import { DashboardActionIconButton } from '@/components/dashboard/dashboard-action-icon-button';

const COURSE_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const { user } = useDashboard();

  const { data: course, isPending, isError, error } = useCourseDetail(slug);
  const editable = course ? canEditCourse(course, user?.id) : false;

  return (
    <RoleGuard allowedRoles={COURSE_MANAGER_ROLES}>
      <CourseFormShell mode="edit">
        {isPending ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError || !course ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
            <p className="text-sm text-destructive">
              {getApiErrorMessage(error, 'Unable to load course.')}
            </p>
            <div className="mt-4 flex justify-center">
              <DashboardActionIconButton
                label="Return to courses"
                icon={ArrowLeft}
                href="/dashboard/courses"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <CourseSubNav slug={slug} active="edit" />
            <CourseOwnerSection course={course} />
            {!editable ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                You can view this course, but only the course owner can edit content and settings.
              </div>
            ) : null}
            <CourseForm
              mode="edit"
              course={course}
              readOnly={!editable}
              onCancel={() => router.push('/dashboard/courses')}
              onSuccess={() => router.push('/dashboard/courses')}
            />
          </div>
        )}
      </CourseFormShell>
    </RoleGuard>
  );
}
