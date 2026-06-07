'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useCourseDetail, usePublishCourse } from '@/hooks/use-courses';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Button } from '@/components/ui/button';
import { CourseBuilderProvider } from '@/components/course-builder/course-builder-context';
import { BuilderHeader } from '@/components/course-builder/builder-header';
import { ModuleSidebar } from '@/components/course-builder/module-sidebar';
import { ContentPanel } from '@/components/course-builder/content-panel';
import { LessonNavFooter } from '@/components/course-builder/lesson-nav-footer';
import { useCourseBuilder } from '@/components/course-builder/course-builder-context';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuthReady } from '@/hooks/use-auth-ready';

const BUILDER_ROLES = [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN, UserRole.LECTURER];

interface CourseBuilderShellProps {
  slug: string;
}

function CourseBuilderShell({ slug }: CourseBuilderShellProps) {
  const authReady = useAuthReady();
  const { data: course, isPending, isError, error, refetch } = useCourseDetail(slug, authReady);
  const { selectedModuleId } = useCourseBuilder();
  const publishMutation = usePublishCourse();

  if (!authReady || isPending) {
    return (
      <div className="course-builder-page flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="course-builder-page flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(error, 'Unable to load course.')}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/courses">Back to courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-builder-page">
      <BuilderHeader
        course={course}
        isPublishing={publishMutation.isPending}
        onPublish={() =>
          publishMutation.mutate(course.id, {
            onSuccess: () => refetch(),
          })
        }
      />

      <div className="course-builder-body">
        <ModuleSidebar courseId={course.id} />

        <div className="course-builder-main">
          <div className="course-builder-content-scroll px-4 py-6 md:px-8 md:py-8">
            <ContentPanel moduleId={selectedModuleId} />
          </div>
          <LessonNavFooter courseId={course.id} />
        </div>
      </div>
    </div>
  );
}

export function CourseBuilderPage({ slug }: CourseBuilderShellProps) {
  return (
    <RoleGuard allowedRoles={BUILDER_ROLES}>
      <CourseBuilderProvider>
        <CourseBuilderShell slug={slug} />
      </CourseBuilderProvider>
    </RoleGuard>
  );
}
