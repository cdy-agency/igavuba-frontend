'use client';

import Link from 'next/link';
import { ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { TiptapContent } from '@/components/editor/TiptapContent';
import { useCourseLearnerResult } from '@/hooks/use-course-results';
import { AssignmentSubmissionStatus } from '@/types/assignment.types';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/course';
import type {
  CourseLearnerAssignmentGrade,
  CourseLearnerQuizAttemptSummary,
  CourseLearnerQuizResult,
} from '@/types/course-results.types';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
}

export function CourseLearnerResultPage({
  courseSlug,
  learnerId,
}: {
  courseSlug: string;
  learnerId: string;
}) {
  const { data, isPending } = useCourseLearnerResult(courseSlug, learnerId, Boolean(learnerId));

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
        Learner result not found.
      </div>
    );
  }

  const publishedAssignments = data.assignmentGrades.filter(
    (entry: CourseLearnerAssignmentGrade) =>
      entry.status === AssignmentSubmissionStatus.PUBLISHED,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/courses" className="hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/dashboard/courses/${courseSlug}/results`}
            className="hover:text-foreground"
          >
            Results
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">
            {data.learner.name ?? data.learner.email}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {data.learner.name ?? 'Learner'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.course.title}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{data.learner.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Enrollment type</dt>
              <dd className="font-medium">{data.enrollment.enrollmentType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Enrolled</dt>
              <dd>{formatDate(data.enrollment.enrolledAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Source</dt>
              <dd>{data.enrollment.source}</dd>
            </div>
            {data.learner.studentId ? (
              <div>
                <dt className="text-muted-foreground">Student ID</dt>
                <dd>{data.learner.studentId}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold">Performance summary</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Progress</p>
              <p className="mt-1 text-2xl font-semibold">
                {Math.round(data.enrollment.progress)}%
              </p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Quiz average</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatPercent(data.performance.quizAverage)}
              </p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Assignment average</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatPercent(data.performance.assignmentAverage)}
              </p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Overall average</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatPercent(data.performance.overallAverage)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm">
            Completion:{' '}
            <span className="font-medium">
              {data.enrollment.isCompleted ? 'Completed' : 'In progress'}
            </span>
            {data.performance.passed !== null ? (
              <>
                {' '}
                · Result:{' '}
                <span
                  className={cn(
                    'font-medium',
                    data.performance.passed ? 'text-emerald-600' : 'text-destructive',
                  )}
                >
                  {data.performance.passed ? 'Passed' : 'Failed'}
                </span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Quiz attempts</h2>
        {data.quizAttempts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No quiz attempts yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {data.quizAttempts.map((quiz: CourseLearnerQuizResult) => (
              <div key={quiz.quizId} className="rounded-md border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{quiz.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Best: {formatPercent(quiz.bestPercentage)} · {quiz.attemptsUsed}{' '}
                      attempt(s)
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      quiz.bestPassed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {quiz.bestPassed ? 'Passed' : 'Not passed'}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {quiz.attempts.map((attempt: CourseLearnerQuizAttemptSummary) => (
                    <div
                      key={attempt.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border bg-muted/10 px-3 py-2 text-sm"
                    >
                      <span>Attempt {attempt.attemptNumber}</span>
                      <span>{formatPercent(attempt.percentage)}</span>
                      <span className="text-muted-foreground">
                        {formatDate(attempt.submittedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Assignment grades & feedback</h2>
        {data.assignmentGrades.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No assignment submissions yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {data.assignmentGrades.map((grade: CourseLearnerAssignmentGrade) => (
              <div key={grade.submissionId} className="rounded-md border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{grade.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Attempt {grade.attemptNumber} · {grade.status}
                    </p>
                  </div>
                  {grade.status === AssignmentSubmissionStatus.PUBLISHED &&
                  grade.score !== null ? (
                    <p className="text-lg font-semibold">
                      {grade.score}/{grade.maxScore}
                    </p>
                  ) : null}
                </div>
                <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                  <p>Submitted: {formatDate(grade.submittedAt)}</p>
                  <p>Graded: {formatDate(grade.gradedAt)}</p>
                  <p>Published: {formatDate(grade.publishedAt)}</p>
                </div>
                {grade.status === AssignmentSubmissionStatus.PUBLISHED &&
                grade.feedback ? (
                  <div className="mt-3 rounded-md border bg-muted/10 p-3 text-sm">
                    {grade.feedback.includes('<') ? (
                      <TiptapContent html={grade.feedback} className="text-sm" />
                    ) : (
                      <p className="whitespace-pre-wrap">{grade.feedback}</p>
                    )}
                  </div>
                ) : grade.status !== AssignmentSubmissionStatus.PUBLISHED ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Feedback will appear after results are published.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {publishedAssignments.length > 0 ? (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Feedback history
            </h3>
            <div className="mt-3 space-y-3">
              {publishedAssignments
                .filter((entry: CourseLearnerAssignmentGrade) => entry.feedback)
                .map((entry: CourseLearnerAssignmentGrade) => (
                  <div key={entry.submissionId} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Published {formatDate(entry.publishedAt)}
                      {entry.grader
                        ? ` · ${entry.grader.name ?? entry.grader.email}`
                        : ''}
                    </p>
                    <div className="mt-2 text-muted-foreground">
                      {entry.feedback?.includes('<') ? (
                        <TiptapContent html={entry.feedback} className="text-sm" />
                      ) : (
                        <p className="whitespace-pre-wrap">{entry.feedback}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
