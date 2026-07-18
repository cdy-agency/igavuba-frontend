'use client';

import { ArrowLeft, GraduationCap, Loader2 } from 'lucide-react';
import { AcademicPolicyForm } from '@/components/academic/academic-policy-form';
import { CourseSubNav } from '@/components/dashboard/courses/course-sub-nav';
import { canEditCourse } from '@/components/dashboard/courses/course-owner-section';
import {
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';
import { useDashboard } from '@/contexts/dashboard-context';
import { useCourseDetail } from '@/hooks/use-courses';
import { getApiErrorMessage } from '@/lib/auth';
import { UserRole } from '@/types/enum';

function canManageCourseSettings(
  course: { ownerId: string; createdById: string },
  userId: string | undefined,
  role: UserRole | null,
) {
  if (role === UserRole.INSTITUTION_ADMIN || role === UserRole.SUPER_ADMIN) {
    return true;
  }

  if (!userId) {
    return false;
  }

  return course.ownerId === userId || course.createdById === userId;
}

export function CourseSettingsPage({ courseSlug }: { courseSlug: string }) {
  const { user, role } = useDashboard();
  const { data: course, isPending, isError, error } = useCourseDetail(courseSlug, Boolean(courseSlug));

  const readOnly = course ? !canManageCourseSettings(course, user?.id, role) : true;
  const isOwner = course ? canEditCourse(course, user?.id) : false;

  return (
    <div className="space-y-6">
      <CourseSubNav slug={courseSlug} active="settings" />

      <div className="flex items-center gap-3">
        <DashboardActionIconButton
          label="Back to course details"
          icon={ArrowLeft}
          href={`/dashboard/courses/${courseSlug}`}
        />
        <div>
          <h1 className="text-2xl font-semibold">Course Settings</h1>
          <p className="text-sm text-muted-foreground">
            {course?.title ? `${course.title} — ` : ''}
            academic policy and completion rules
          </p>
        </div>
      </div>

      {isPending ? (
        <div className="flex min-h-[16rem] items-center justify-center rounded-lg border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isError || !course ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-8 text-center text-sm text-destructive">
          {getApiErrorMessage(error, 'Unable to load course settings.')}
        </div>
      ) : (
        <div className="space-y-4">
          {!isOwner && readOnly ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You can view these settings, but only the course owner or institution admin can
              change them.
            </div>
          ) : null}

          <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Academic Policy</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configure certificate and completion requirements for this course. Assessment-specific
                  rules are edited from each quiz, assignment, or exam in the course builder.
                </p>
              </div>
            </div>

            <AcademicPolicyForm courseIdOrSlug={courseSlug} readOnly={readOnly} />
          </section>
        </div>
      )}
    </div>
  );
}
