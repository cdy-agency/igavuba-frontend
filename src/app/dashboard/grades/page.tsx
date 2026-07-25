'use client';

import Link from 'next/link';
import { BarChart3, ChevronRight, Loader2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { useCoursesList } from '@/hooks/use-courses';
import type { Course } from '@/types/course';
import { UserRole } from '@/types/enum';
import { cn } from '@/lib/utils';

const GRADES_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER];

function GradesHubContent() {
  const { data, isPending } = useCoursesList({ page: 1, limit: 50 });

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const courses = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Course Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a course to review learner performance, quiz averages, and assignment grades.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {courses.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No courses available.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {courses.map((course: Course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.slug}/results`}
                className={cn(
                  'group flex cursor-pointer items-center justify-between gap-3 px-4 py-4 transition-colors sm:px-5',
                  'hover:bg-muted/40',
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground group-hover:text-primary">
                    {course.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{course.status}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground group-hover:text-primary">
                  <BarChart3 className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GradesPage() {
  return (
    <RoleGuard allowedRoles={GRADES_ROLES}>
      <GradesHubContent />
    </RoleGuard>
  );
}
