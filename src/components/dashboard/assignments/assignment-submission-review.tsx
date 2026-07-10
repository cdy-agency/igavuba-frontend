'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TiptapContent } from '@/components/editor/TiptapContent';
import {
  useAssignmentSubmission,
  usePublishAssignmentGrade,
  useSaveAssignmentGrade,
} from '@/hooks/use-assignment-submission';
import { gradeAssignmentSubmissionSchema } from '@/schema/assignment-submission.schema';
import { AssignmentSubmissionStatus } from '@/types/assignment.types';
import { buildAssessmentsPath } from '@/lib/course-builder-navigation';
import { toast } from '@/lib/toast';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AssignmentSubmissionReview({
  assignmentId,
  submissionId,
}: {
  assignmentId: string;
  submissionId: string;
}) {
  const { data, isPending } = useAssignmentSubmission(submissionId, Boolean(submissionId));
  const saveGrade = useSaveAssignmentGrade(assignmentId);
  const publishGrade = usePublishAssignmentGrade(assignmentId);

  const maxScore = data?.assignment.maxScore ?? 100;
  const gradeSchema = useMemo(() => gradeAssignmentSubmissionSchema(maxScore), [maxScore]);

  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!data?.submission) return;
    setScore(data.submission.score?.toString() ?? '');
    setFeedback(data.submission.feedback ?? '');
  }, [data?.submission]);

  const handleSaveGrade = async () => {
    const validation = gradeSchema.safeParse({ score, feedback });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? 'Invalid grade');
      return;
    }

    await saveGrade.mutateAsync({
      submissionId,
      payload: validation.data,
    });
  };

  const handlePublish = async () => {
    await publishGrade.mutateAsync(submissionId);
  };

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
        Submission not found.
      </div>
    );
  }

  const { assignment, submission } = data;
  const isPublished = submission.status === AssignmentSubmissionStatus.PUBLISHED;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href={buildAssessmentsPath('assignments')} className="hover:text-foreground">
            Assessments
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Assignments</span>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/dashboard/assignments/${assignmentId}/submissions`}
            className="hover:text-foreground"
          >
            Submissions
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Review</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{assignment.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Attempt {submission.attemptNumber} · {submission.status}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Student information</h2>
            <p className="mt-2 font-medium">{submission.learner.name ?? submission.learner.email}</p>
            <p className="text-sm text-muted-foreground">{submission.learner.email}</p>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Submitted:</span>{' '}
              {formatDate(submission.submittedAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Attempt:</span> {submission.attemptNumber}
            </p>
            <p>
              <span className="text-muted-foreground">Graded:</span>{' '}
              {formatDate(submission.gradedAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Published:</span>{' '}
              {formatDate(submission.publishedAt)}
            </p>
          </div>

          {submission.textAnswer ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Submitted text
              </h3>
              <div className="rounded-md border p-3">
                <TiptapContent
                  html={submission.textAnswer}
                  className="text-sm text-foreground course-content-font"
                />
              </div>
            </div>
          ) : null}

          {submission.fileUrl ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Uploaded file
              </h3>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View uploaded file
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : null}

          {submission.linkUrl ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Submitted link
              </h3>
              <a
                href={submission.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View submitted link
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Grade form</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Passing score: {assignment.passingScore}% · Max score: {maxScore}
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="submission-score">Score (0-{maxScore})</Label>
              <Input
                id="submission-score"
                type="number"
                min={0}
                max={maxScore}
                value={score}
                onChange={(event) => setScore(event.target.value)}
                disabled={isPublished || saveGrade.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="submission-feedback">Feedback</Label>
              <Textarea
                id="submission-feedback"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                rows={6}
                disabled={isPublished || saveGrade.isPending}
              />
            </div>
          </div>

          {submission.passed !== null && submission.score !== null ? (
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium">
                {submission.passed ? 'Pass' : 'Fail'} · Score {submission.score}/{maxScore}
              </p>
              {submission.grader ? (
                <p className="mt-1 text-muted-foreground">
                  Graded by {submission.grader.name ?? submission.grader.email}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveGrade}
              disabled={isPublished || saveGrade.isPending}
            >
              {saveGrade.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Grade
            </Button>
            <Button
              type="button"
              onClick={handlePublish}
              disabled={isPublished || publishGrade.isPending}
            >
              {publishGrade.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish Result
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
