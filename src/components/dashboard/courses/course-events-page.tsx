'use client';

import { ArrowLeft } from 'lucide-react';
import { CourseSubNav } from '@/components/dashboard/courses/course-sub-nav';
import { EventsTable } from '@/components/dashboard/events/events-table';
import { DashboardActionIconButton } from '@/components/dashboard/dashboard-action-icon-button';

export function CourseEventsPage({
  courseSlug,
  courseTitle,
  courseId,
}: {
  courseSlug: string;
  courseTitle?: string;
  courseId?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <DashboardActionIconButton href="/dashboard/courses" label="Back to courses" icon={ArrowLeft} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{courseTitle ?? 'Course events'}</h1>
          <p className="text-sm text-muted-foreground">
            Schedule revision sessions and other events for enrolled learners.
          </p>
        </div>
      </div>

      <CourseSubNav slug={courseSlug} active="events" />

      <EventsTable courseId={courseId} defaultScope="COURSE" />
    </div>
  );
}
