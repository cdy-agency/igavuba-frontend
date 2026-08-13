'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Calendar, CheckCircle2, ExternalLink, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { uploadFile } from '@/api/upload';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { TiptapContent } from '@/components/editor/TiptapContent';
import {
  useDeleteAssignmentSubmission,
  useMyAssignmentSubmissions,
  useSubmitAssignment,
} from '@/hooks/use-assignment-submission';
import { submitAssignmentSchema, hasRichTextContent } from '@/schema/assignment-submission.schema';
import type { AssignmentSubmission } from '@/types/assignment-submission.types';
import { AssignmentSubmissionType, AssignmentSubmissionStatus } from '@/types/assignment.types';
import type { LearningAssignmentContent } from '@/types/assignment.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface AssignmentPlayerProps {
  assignmentId: string;
  courseId: string;
  courseSlug?: string;
  title: string;
  description?: string | null;
  assignmentMeta: LearningAssignmentContent;
  isCompleted?: boolean;
  onComplete?: () => void;
  onContinue?: () => void;
  onProgressUpdated?: (progress: number) => void;
  continueBlockMessage?: string | null;
}

function formatDueDate(value: string | null) {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function parseSubmissionTypes(value: unknown): AssignmentSubmissionType[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [AssignmentSubmissionType.TEXT];
  }
  return value as AssignmentSubmissionType[];
}

export function AssignmentPlayer({
  assignmentId,
  courseId,
  courseSlug,
  title,
  description,
  assignmentMeta,
  isCompleted,
  onComplete,
  onContinue,
  onProgressUpdated,
  continueBlockMessage,
}: AssignmentPlayerProps) {
  const { data: history, isPending } = useMyAssignmentSubmissions(
    assignmentId,
    courseId,
  );
  const submitAssignment = useSubmitAssignment(assignmentId, courseId, courseSlug);
  const deleteSubmission = useDeleteAssignmentSubmission(
    assignmentId,
    courseId,
    courseSlug,
  );

  const [textAnswer, setTextAnswer] = useState('<p></p>');
  const [fileUrl, setFileUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [continueError, setContinueError] = useState<string | null>(null);
  const [submissionToDelete, setSubmissionToDelete] = useState<AssignmentSubmission | null>(
    null,
  );

  const enabledTypes = useMemo(
    () => parseSubmissionTypes(assignmentMeta.submissionTypes),
    [assignmentMeta.submissionTypes],
  );

  const attemptsRemaining = history?.attemptsRemaining ?? assignmentMeta.maxAttempts;
  const canSubmit = attemptsRemaining > 0;
  const latestGrade = history?.latestGrade?.grade;
  const maxScore = history?.maxScore ?? assignmentMeta.maxScore ?? 100;
  const isUnderReview = Boolean(
    history?.submissions?.some(
      (entry: AssignmentSubmission) =>
        entry.status === AssignmentSubmissionStatus.SUBMITTED ||
        entry.status === AssignmentSubmissionStatus.GRADED,
    ),
  );
  const hasPassed =
    latestGrade?.passed === true ||
    Boolean(
      history?.submissions?.some(
        (entry: AssignmentSubmission) =>
          entry.status === AssignmentSubmissionStatus.PUBLISHED &&
          entry.grade?.passed === true,
      ),
    );
  const hasFailedPublished = latestGrade?.passed === false;
  const contentCompleted = isCompleted || history?.contentCompleted === true;
  const hasSubmitted = (history?.submissions?.length ?? 0) > 0;
  // Re-attempt only after a published fail (or first attempt). Never while under review or after pass.
  const showSubmissionForm = canSubmit && !isUnderReview && !hasPassed;
  const gradedSubmissions = useMemo(
    () =>
      (history?.submissions ?? []).filter(
        (entry: AssignmentSubmission) =>
          entry.status === AssignmentSubmissionStatus.PUBLISHED &&
          entry.grade?.score != null,
      ),
    [history?.submissions],
  );
  const bestSubmissionId = useMemo(() => {
    if (!gradedSubmissions.length) return null;
    return gradedSubmissions.reduce((best: AssignmentSubmission, entry: AssignmentSubmission) => {
      const bestScore = best.grade?.score ?? -1;
      const entryScore = entry.grade?.score ?? -1;
      return entryScore > bestScore ? entry : best;
    }).id;
  }, [gradedSubmissions]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const selectedSubmission =
    (history?.submissions ?? []).find(
      (entry: AssignmentSubmission) => entry.id === selectedSubmissionId,
    ) ?? null;
  const lastReportedProgressRef = useRef<number | null>(null);
  const onProgressUpdatedRef = useRef(onProgressUpdated);
  onProgressUpdatedRef.current = onProgressUpdated;

  useEffect(() => {
    if (continueBlockMessage) {
      setContinueError(continueBlockMessage);
    }
  }, [continueBlockMessage, assignmentId]);

  useEffect(() => {
    lastReportedProgressRef.current = null;
  }, [assignmentId]);

  useEffect(() => {
    if (
      !history?.contentCompleted ||
      history.courseProgress === undefined ||
      !onProgressUpdatedRef.current
    ) {
      return;
    }

    if (lastReportedProgressRef.current === history.courseProgress) {
      return;
    }

    lastReportedProgressRef.current = history.courseProgress;
    onProgressUpdatedRef.current(history.courseProgress);
  }, [history?.contentCompleted, history?.courseProgress]);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setFileUrl(url);
      toast.success('File uploaded successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to upload file.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const validation = submitAssignmentSchema.safeParse({
      textAnswer,
      fileUrl,
      linkUrl,
      enabledTypes,
    });

    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? 'Invalid submission';
      setFormError(message);
      toast.error(message);
      return;
    }

    setFormError(null);
    setContinueError(null);

    try {
      const response = await submitAssignment.mutateAsync({
        textAnswer: hasRichTextContent(textAnswer) ? textAnswer : undefined,
        fileUrl: fileUrl.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
      });
      if (response.data.markedComplete && response.data.courseProgress !== undefined) {
        onProgressUpdated?.(response.data.courseProgress);
      }
      setTextAnswer('<p></p>');
      setFileUrl('');
      setLinkUrl('');
    } catch {
      // toast handled in hook
    }
  };

  const handleContinue = () => {
    if (contentCompleted) {
      setContinueError(null);
      onContinue?.();
      return;
    }

    if (!hasSubmitted) {
      setContinueError('Submit this assignment before continuing to the next lesson.');
      return;
    }

    setContinueError(null);

    if (onComplete) {
      onComplete();
      return;
    }

    onContinue?.();
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      const response = await deleteSubmission.mutateAsync(submissionToDelete.id);
      if (response.data.courseProgress !== undefined) {
        onProgressUpdated?.(response.data.courseProgress);
      }
      setSubmissionToDelete(null);
    } catch {
      // toast handled in hook
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>

      <div className="grid gap-4 rounded-lg border bg-muted/20 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Due date</p>
          <p className="mt-1 flex items-center gap-2 font-medium">
            <Calendar className="h-4 w-4" />
            {formatDueDate(assignmentMeta.dueDate)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Attempts remaining</p>
          <p className="mt-1 text-2xl font-semibold">{attemptsRemaining}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Passing score</p>
          <p className="mt-1 text-2xl font-semibold">{assignmentMeta.passingScore}%</p>
        </div>
      </div>

      {assignmentMeta.instructions ? (
        <div className="rounded-lg border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Instructions
          </p>
          <div className="mt-2">
            <TiptapContent
              html={assignmentMeta.instructions}
              className="text-sm text-foreground course-content-font"
            />
          </div>
        </div>
      ) : null}

      {isUnderReview ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Your submission is under review. You cannot submit another attempt until grading is
          published.
        </div>
      ) : null}

      {hasPassed ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          You have already passed this assignment. No further attempts are needed.
        </div>
      ) : null}

      {latestGrade ? (
        <div
          className={cn(
            'rounded-lg border p-5',
            latestGrade.passed
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-destructive/30 bg-destructive/5',
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your marks
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {latestGrade.score}/{maxScore}
            {latestGrade.score != null && maxScore > 0 ? (
              <span className="ml-2 text-base font-medium text-muted-foreground">
                ({Math.round((latestGrade.score / maxScore) * 100)}%)
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm font-medium">
            {latestGrade.passed ? 'Passed' : 'Did not pass'} · {latestGrade.passingScore}% required
            to pass
          </p>
          {latestGrade.publishedAt ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Published {formatDueDate(latestGrade.publishedAt)}
            </p>
          ) : null}
          {latestGrade.feedback ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {latestGrade.feedback}
            </p>
          ) : null}
        </div>
      ) : null}

      {gradedSubmissions.length > 0 ? (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Attempt marks</h3>
            {!canSubmit ? (
              <p className="text-xs text-muted-foreground">
                No attempts left · tap an attempt for details
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            {gradedSubmissions.map((submission: AssignmentSubmission) => {
              const score = submission.grade?.score ?? 0;
              const submissionMax = submission.grade?.maxScore ?? maxScore;
              const percentage =
                submissionMax > 0 ? Math.round((score / submissionMax) * 100) : 0;
              const isBest = submission.id === bestSubmissionId;
              const isSelected = submission.id === selectedSubmissionId;

              return (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() =>
                    setSelectedSubmissionId((current) =>
                      current === submission.id ? null : submission.id,
                    )
                  }
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-muted/40',
                    isBest ? 'border-emerald-300 bg-emerald-50/60' : 'border-border',
                    isSelected && 'ring-2 ring-primary/30',
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">
                      Attempt {submission.attemptNumber}
                      {isBest ? ' · Best' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.submittedAt
                        ? formatDueDate(submission.submittedAt)
                        : 'Submitted'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        submission.grade?.passed ? 'text-emerald-600' : 'text-destructive',
                      )}
                    >
                      {score}/{submissionMax} · {percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.grade?.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedSubmission?.grade ? (
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium">
                Attempt {selectedSubmission.attemptNumber} details
                {selectedSubmission.id === bestSubmissionId ? ' · Highest mark' : ''}
              </p>
              <p className="mt-1">
                Score: {selectedSubmission.grade.score}/{selectedSubmission.grade.maxScore ?? maxScore}
              </p>
              {selectedSubmission.grade.feedback ? (
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                  {selectedSubmission.grade.feedback}
                </p>
              ) : (
                <p className="mt-2 text-muted-foreground">No written feedback for this attempt.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {showSubmissionForm ? (
        <div className="space-y-4 rounded-lg border p-5">
          <h3 className="text-lg font-semibold">
            {hasFailedPublished ? 'Try again' : 'Submit your work'}
          </h3>

          {hasFailedPublished ? (
            <p className="text-sm text-muted-foreground">
              Your previous attempt did not pass. Submit a new attempt ({attemptsRemaining} remaining).
            </p>
          ) : null}

          {enabledTypes.includes(AssignmentSubmissionType.TEXT) ? (
            <div className="space-y-1.5">
              <Label>Text response</Label>
              <TiptapEditor
                name="assignment-text-response"
                content={textAnswer}
                onChange={setTextAnswer}
                placeholder="Write your answer here..."
                stickyToolbar={false}
              />
            </div>
          ) : null}

          {enabledTypes.includes(AssignmentSubmissionType.FILE) ? (
            <div className="space-y-2">
              <Label>File upload</Label>
              <Input
                type="file"
                onChange={(event) => void handleFileUpload(event.target.files?.[0] ?? null)}
                disabled={uploading || submitAssignment.isPending}
              />
              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Upload className="h-4 w-4" />
                  Uploaded file ready to submit
                </a>
              ) : null}
            </div>
          ) : null}

          {enabledTypes.includes(AssignmentSubmissionType.LINK) ? (
            <div className="space-y-1.5">
              <Label htmlFor="assignment-link">Submission link</Label>
              <Input
                id="assignment-link"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          ) : null}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitAssignment.isPending || uploading}
          >
            {submitAssignment.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit {hasFailedPublished ? 'new attempt' : 'Assignment'}
          </Button>
        </div>
      ) : !canSubmit && !hasPassed && !isUnderReview ? (
        <div className="rounded-lg border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
          You have used all available attempts for this assignment.
        </div>
      ) : null}

      {history?.submissions?.length ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Your submissions</h3>
          {history.submissions.map((submission: AssignmentSubmission) => (
            <div key={submission.id} className="rounded-lg border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">Attempt {submission.attemptNumber}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase">
                    {submission.status}
                  </span>
                  {submission.deletable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      disabled={deleteSubmission.isPending}
                      onClick={() => setSubmissionToDelete(submission)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="mt-1 text-muted-foreground">
                Submitted {submission.submittedAt ? formatDueDate(submission.submittedAt) : '—'}
              </p>
              {submission.grade?.score != null ? (
                <p
                  className={cn(
                    'mt-2 text-sm font-semibold',
                    submission.grade.passed ? 'text-emerald-600' : 'text-destructive',
                  )}
                >
                  Mark: {submission.grade.score}/{submission.grade.maxScore ?? maxScore}
                  {submission.id === bestSubmissionId ? ' · Best' : ''}
                </p>
              ) : null}
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
                  className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View uploaded file
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {submission.linkUrl ? (
                <a
                  href={submission.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View submitted link
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {continueError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{continueError}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {contentCompleted ? (
          <div className="inline-flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Assignment completed
          </div>
        ) : null}
        <Button type="button" onClick={handleContinue}>
          Continue Learning
        </Button>
      </div>

      <AlertDialog
        open={submissionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSubmissionToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this attempt?</AlertDialogTitle>
            <AlertDialogDescription>
              Attempt {submissionToDelete?.attemptNumber} will be removed and you will get that
              attempt back. This cannot be undone. Graded submissions cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmission.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSubmission.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteSubmission();
              }}
            >
              {deleteSubmission.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete attempt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
