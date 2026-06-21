'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TiptapContent } from '@/components/editor/TiptapContent';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import {
  useAssignmentSubmissions,
  usePublishAssignmentGrade,
  useSaveAssignmentGrade,
} from '@/hooks/use-assignment-submission';
import { gradeAssignmentSubmissionSchema } from '@/schema/assignment-submission.schema';
import type { LecturerAssignmentSubmission } from '@/types/assignment-submission.types';
import { toast } from '@/lib/toast';

const ASSIGNMENT_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function SubmissionGradePanel({
  assignmentId,
  submission,
}: {
  assignmentId: string;
  submission: LecturerAssignmentSubmission;
}) {
  const [score, setScore] = useState(submission.score ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const saveGrade = useSaveAssignmentGrade(assignmentId);
  const publishGrade = usePublishAssignmentGrade(assignmentId);

  const handleSaveDraft = async () => {
    const validation = gradeAssignmentSubmissionSchema.safeParse({ score, feedback });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? 'Invalid grade');
      return;
    }

    await saveGrade.mutateAsync({
      submissionId: submission.id,
      payload: validation.data,
    });
  };

  const handlePublish = async () => {
    await publishGrade.mutateAsync(submission.id);
  };

  return (
    <div className="mt-4 grid gap-3 rounded-md border bg-muted/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Score (0-100)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(event) => setScore(event.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Feedback</Label>
          <Textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={4}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={saveGrade.isPending}
        >
          Save Draft Grade
        </Button>
        <Button type="button" onClick={handlePublish} disabled={publishGrade.isPending}>
          Publish Grade
        </Button>
      </div>
    </div>
  );
}

function AssignmentSubmissionsContent() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = params.assignmentId;
  const { data, isPending } = useAssignmentSubmissions(assignmentId, Boolean(assignmentId));

  const submissions = useMemo(() => data?.submissions ?? [], [data?.submissions]);

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
          <Link href="/dashboard/assignments" className="hover:text-foreground">
            Assignments
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Submissions</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {data?.assignment.title ?? 'Assignment Submissions'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review learner submissions, save draft grades, and publish results.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="rounded-lg border px-6 py-12 text-center text-sm text-muted-foreground">
            No submissions yet.
          </div>
        ) : (
          submissions.map((submission: LecturerAssignmentSubmission) => (
            <div key={submission.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{submission.learner.name ?? submission.learner.email}</p>
                  <p className="text-sm text-muted-foreground">{submission.learner.email}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase">
                  {submission.status}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <p>
                  <span className="text-muted-foreground">Submitted:</span>{' '}
                  {formatDate(submission.submittedAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">Attempt:</span>{' '}
                  {submission.attemptNumber}
                </p>
                <p>
                  <span className="text-muted-foreground">Published:</span>{' '}
                  {formatDate(submission.gradePublishedAt)}
                </p>
              </div>
              {submission.textAnswer ? (
                <div className="mt-3 rounded-md border p-3">
                  <TiptapContent
                    html={submission.textAnswer}
                    className="text-sm text-foreground course-content-font"
                  />
                </div>
              ) : null}
              {submission.fileUrl ? (
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  View uploaded file
                </a>
              ) : null}
              {submission.linkUrl ? (
                <a
                  href={submission.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  View submitted link
                </a>
              ) : null}
              <SubmissionGradePanel assignmentId={assignmentId} submission={submission} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AssignmentSubmissionsPage() {
  return (
    <RoleGuard allowedRoles={ASSIGNMENT_MANAGER_ROLES}>
      <AssignmentSubmissionsContent />
    </RoleGuard>
  );
}
