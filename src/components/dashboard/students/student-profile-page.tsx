'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardActionIconButton } from '@/components/dashboard/dashboard-action-icon-button';
import { useDashboard } from '@/contexts/dashboard-context';
import { useStudent } from '@/hooks/use-students';
import { removeLearnerFromCourse } from '@/api/enrollment.api';
import { toast } from '@/lib/toast';
import type { StudentCourseEnrollment } from '@/types/student.types';
import { UserRole } from '@/types/enum';
import { getUserStatusClassName, getUserStatusLabel } from '@/lib/status-utils';

export function StudentProfilePage({ studentId }: { studentId: string }) {
  const { role } = useDashboard();
  const queryClient = useQueryClient();
  const { data: student, isPending, isError } = useStudent(studentId);

  const removeEnrollment = useMutation({
    mutationFn: (courseIdOrSlug: string) => removeLearnerFromCourse(courseIdOrSlug, studentId),
    onSuccess: () => {
      toast.success('Course assignment removed successfully.');
      queryClient.invalidateQueries({ queryKey: ['students', 'detail', studentId] });
    },
    onError: () => {
      toast.error('Unable to remove course assignment.');
    },
  });

  if (isPending) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Student not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <DashboardActionIconButton
          label="Back to students"
          icon={ArrowLeft}
          href="/dashboard/students"
        />
        <div>
          <h1 className="text-2xl font-semibold">{student.name ?? 'Student'}</h1>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Student ID</dt>
              <dd className="font-medium">{student.studentId ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge className={getUserStatusClassName(student.status)}>
                  {getUserStatusLabel(student.status)}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Institution</dt>
              <dd>{student.institution?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Department</dt>
              <dd>{student.department?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Program</dt>
              <dd>{student.program ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{format(new Date(student.createdAt), 'PPP')}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Courses</h2>
          </div>
          {student.courses?.length ? (
            <ul className="space-y-3">
              {student.courses.map((entry: StudentCourseEnrollment) => (
                <li
                  key={entry.enrollmentId}
                  className="flex items-center justify-between rounded-md border px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{entry.course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Enrolled {format(new Date(entry.enrolledAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">{Math.round(entry.progress)}%</p>
                    <div className="flex flex-col items-end gap-2">
                      <Button asChild variant="link" className="h-auto p-0 text-xs">
                        <Link href={`/learn/${entry.course.slug}`}>Open</Link>
                      </Button>
                      {role === UserRole.INSTITUTION_ADMIN ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          disabled={removeEnrollment.isLoading}
                          onClick={() => removeEnrollment.mutate(entry.course.slug)}
                        >
                          {removeEnrollment.isLoading ? 'Removing…' : 'Remove assignment'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
