'use client';

import { format } from 'date-fns';
import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CourseSubNav } from '@/components/dashboard/courses/course-sub-nav';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';
import { useCourseStudents } from '@/hooks/use-internal-enrollment';
import type { CourseStudentRow } from '@/types/student.types';
import { getUserStatusClassName, getUserStatusLabel } from '@/lib/status-utils';

export function CourseStudentsPage({
  courseSlug,
  courseTitle,
}: {
  courseSlug: string;
  courseTitle?: string;
}) {
  const { data: studentsData, isPending } = useCourseStudents(courseSlug);
  const students = studentsData ?? [];

  return (
    <div className="space-y-6">
      <CourseSubNav slug={courseSlug} active="students" />
      <div className="flex items-center gap-3">
        <DashboardActionIconButton
          label="Back to course"
          icon={ArrowLeft}
          href={`/dashboard/courses/${courseSlug}`}
        />
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            {courseTitle ? `${courseTitle} — ` : ''}
            enrolled internal students
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        {isPending ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No students enrolled in this course yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Enrolled</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row: CourseStudentRow) => (
                  <tr key={row.enrollmentId} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{row.studentId ?? '—'}</td>
                    <td className="px-4 py-3">{row.name ?? '—'}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.department?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge className={getUserStatusClassName(row.status as never)}>
                        {getUserStatusLabel(row.status as never)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{Math.round(row.progress)}%</td>
                    <td className="px-4 py-3">
                      {format(new Date(row.enrolledAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <DashboardActionGroup className="justify-end">
                        <DashboardActionIconButton
                          label="View profile"
                          icon={Eye}
                          variant="primary"
                          href={`/dashboard/students/${row.learnerProfileId}`}
                        />
                      </DashboardActionGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
