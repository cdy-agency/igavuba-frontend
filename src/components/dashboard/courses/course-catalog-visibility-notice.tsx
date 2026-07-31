'use client';

import { Globe, Lock } from 'lucide-react';
import type { Course } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import {
  getCourseAccessTypeLabel,
  isPublicCatalogAccessType,
} from '@/lib/course-utils';
import { cn } from '@/lib/utils';

interface CourseCatalogVisibilityNoticeProps {
  course: Course;
}

export function CourseCatalogVisibilityNotice({
  course,
}: CourseCatalogVisibilityNoticeProps) {
  if (course.status !== CourseLifecycleStatus.PUBLISHED) {
    return null;
  }

  const accessType = course.liveAccessType ?? course.accessType;
  const catalogVisible = isPublicCatalogAccessType(accessType);

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        catalogVisible
          ? 'border-success/30 bg-success/5 text-success-foreground'
          : 'border-amber-500/30 bg-amber-50 text-amber-950',
      )}
    >
      <div className="flex items-start gap-3">
        {catalogVisible ? (
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        ) : (
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        )}
        <div>
          <p className="font-semibold">
            {catalogVisible
              ? 'Visible on public catalog'
              : 'Hidden from public catalog'}
          </p>
          <p className="mt-1 text-xs opacity-90">
            Access type: <strong>{getCourseAccessTypeLabel(accessType)}</strong>
            {catalogVisible
              ? ' — learners can find this course on / and /courses.'
              : ' — only enrolled institution learners can access this course.'}
          </p>
          {course.hasUnpublishedChanges ? (
            <p className="mt-2 text-xs opacity-90">
              Content and description changes still require revision approval in
              the course builder. Access type changes apply immediately.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
