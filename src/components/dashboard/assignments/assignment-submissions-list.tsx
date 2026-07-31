'use client';

import Link from 'next/link';
import { ChevronRight, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useAssignmentSubmissions,
  usePublishAllAssignmentResults,
} from '@/hooks/use-assignment-submission';
import type { LecturerAssignmentSubmission } from '@/types/assignment-submission.types';
import { buildAssessmentsPath } from '@/lib/course-builder-navigation';
import { AssignmentSubmissionStatus } from '@/types/assignment.types';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusLabel(status: string) {
  if (status === AssignmentSubmissionStatus.PUBLISHED) return 'Published';
  if (status === AssignmentSubmissionStatus.GRADED) return 'Graded';
  if (status === AssignmentSubmissionStatus.SUBMITTED) return 'Submitted';
  return status;
}

export function AssignmentSubmissionsList({ assignmentId }: { assignmentId: string }) {
  const { data, isPending } = useAssignmentSubmissions(assignmentId, Boolean(assignmentId));
  const publishAll = usePublishAllAssignmentResults(assignmentId);

  const submissions = data?.submissions ?? [];
  const gradedCount = submissions.filter(
    (entry: LecturerAssignmentSubmission) =>
      entry.status === AssignmentSubmissionStatus.GRADED,
  ).length;

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href={buildAssessmentsPath('assignments')} className="hover:text-foreground">
            Assessments
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Assignments</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Submissions</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {data?.assignment.title ?? 'Assignment Submissions'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review learner submissions, grade work, and publish results.
            </p>
          </div>
          {gradedCount > 0 ? (
            <Button
              type="button"
              onClick={() => publishAll.mutate()}
              disabled={publishAll.isPending}
            >
              {publishAll.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Publish All Graded ({gradedCount})
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {submissions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No submissions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission: LecturerAssignmentSubmission) => (
                  <tr key={submission.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {submission.learner.name ?? submission.learner.email}
                      </p>
                      <p className="text-xs text-muted-foreground">{submission.learner.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td className="px-4 py-3">{statusLabel(submission.status)}</td>
                    <td className="px-4 py-3">
                      {submission.score !== null && submission.score !== undefined
                        ? submission.score
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(submission.publishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <DashboardActionGroup className="justify-end">
                        <DashboardActionIconButton
                          label="Review submission"
                          icon={Eye}
                          variant="primary"
                          href={`/dashboard/assignments/${assignmentId}/submissions/${submission.id}`}
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
