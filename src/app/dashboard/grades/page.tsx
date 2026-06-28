'use client';

import Link from 'next/link';
import { BarChart3, Loader2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { Button } from '@/components/ui/button';
import { useCoursesList } from '@/hooks/use-courses';
import type { Course } from '@/types/course';
import { UserRole } from '@/types/enum';

const GRADES_ROLES = [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN, UserRole.LECTURER];

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
          <div className="divide-y">
            {courses.map((course: Course) => (
              <div
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.status}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/courses/${course.slug}/results`}>
                    <BarChart3 className="mr-1 h-3.5 w-3.5" />
                    View results
                  </Link>
                </Button>
              </div>
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
