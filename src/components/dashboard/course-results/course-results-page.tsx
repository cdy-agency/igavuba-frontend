'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCourseResults } from '@/hooks/use-course-results';
import type {
  CourseLearnerResultRow,
  CourseResultsEnrollmentFilter,
  CourseResultsStatusFilter,
} from '@/types/course-results.types';
import { cn } from '@/lib/utils';

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function StatusBadge({
  completed,
  passed,
}: {
  completed: boolean;
  passed: boolean | null;
}) {
  if (completed) {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        Completed
      </span>
    );
  }

  if (passed === true) {
    return (
      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        Passed
      </span>
    );
  }

  if (passed === false) {
    return (
      <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        Failed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      In Progress
    </span>
  );
}

export function CourseResultsPage({ courseSlug }: { courseSlug: string }) {
  const [enrollmentType, setEnrollmentType] =
    useState<CourseResultsEnrollmentFilter>('all');
  const [status, setStatus] = useState<CourseResultsStatusFilter>('all');

  const queryParams = useMemo(
    () => ({ enrollmentType, status }),
    [enrollmentType, status],
  );

  const { data, isPending } = useCourseResults(courseSlug, queryParams, Boolean(courseSlug));

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border px-6 py-12 text-center text-sm text-muted-foreground">
        Unable to load course results.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/courses" className="hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/builder/course/${data.course.slug}`} className="hover:text-foreground">
            {data.course.title}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Results</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Course Results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.summary.filteredCount} of {data.summary.totalLearners} learners ·{' '}
            {data.course.quizCount} quizzes · {data.course.assignmentCount} assignments
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <Select
          value={enrollmentType}
          onValueChange={(value) =>
            setEnrollmentType(value as CourseResultsEnrollmentFilter)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Enrollment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All learners</SelectItem>
            <SelectItem value="internal">Internal learners</SelectItem>
            <SelectItem value="public">Public learners</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as CourseResultsStatusFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {data.learners.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No learners match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Quiz Avg</th>
                  <th className="px-4 py-3 font-medium">Assignment Avg</th>
                  <th className="px-4 py-3 font-medium">Overall</th>
                  <th className="px-4 py-3 font-medium">Completed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.learners.map((learner: CourseLearnerResultRow) => (
                  <tr key={learner.learnerId} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{learner.name}</p>
                      <p className="text-xs text-muted-foreground">{learner.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          learner.enrollmentType === 'INTERNAL'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-violet-100 text-violet-700',
                        )}
                      >
                        {learner.enrollmentType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{Math.round(learner.progress)}%</td>
                    <td className="px-4 py-3">{formatPercent(learner.quizAverage)}</td>
                    <td className="px-4 py-3">{formatPercent(learner.assignmentAverage)}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPercent(learner.overallAverage)}
                    </td>
                    <td className="px-4 py-3">
                      {learner.completed ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge completed={learner.completed} passed={learner.passed} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/courses/${courseSlug}/results/${learner.learnerId}`}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
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
