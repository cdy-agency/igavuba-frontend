'use client';

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCourseCertificateEligibility } from '@/hooks/use-academic';
import type { AssessmentSummaryItem, CertificateEligibilityResult } from '@/types/academic.types';
import { cn } from '@/lib/utils';

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value)}%`;
}

function ProgressRow({
  label,
  passed,
  pending,
}: {
  label: string;
  passed: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {passed ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : pending ? (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      )}
      <span className={cn(!passed && !pending && 'text-foreground')}>{label}</span>
    </div>
  );
}

function assessmentProgressLabel(item: AssessmentSummaryItem) {
  const typeLabel =
    item.type === 'QUIZ' ? 'Quiz' : item.type === 'EXAM' ? 'Exam' : 'Assignment';
  const statusSuffix =
    item.status === 'PASSED'
      ? 'Passed'
      : item.status === 'ATTEMPTS_EXHAUSTED'
        ? 'Attempts Exhausted'
        : item.status === 'FAILED'
          ? 'Failed'
          : item.status === 'AWAITING_REVIEW' || item.status === 'SUBMITTED'
            ? 'Awaiting grading'
            : 'Pending';
  return `${typeLabel}: ${item.title} ${statusSuffix}`;
}

interface CertificateProgressCardProps {
  courseIdOrSlug: string;
  courseTitle?: string;
  className?: string;
}

export function CertificateProgressCard({
  courseIdOrSlug,
  courseTitle,
  className,
}: CertificateProgressCardProps) {
  const { data, isPending, isError } = useCourseCertificateEligibility(courseIdOrSlug);

  if (isPending) {
    return (
      <div className={cn('flex min-h-[8rem] items-center justify-center rounded-lg border', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className={cn(
          'rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-5 text-sm text-destructive',
          className,
        )}
      >
        Unable to load certificate progress.
      </div>
    );
  }

  return (
    <CertificateProgressContent
      data={data}
      courseTitle={courseTitle}
      className={className}
    />
  );
}

export function CertificateProgressContent({
  data,
  courseTitle,
  className,
}: {
  data: CertificateEligibilityResult;
  courseTitle?: string;
  className?: string;
}) {
  const certificateAssessments = data.requiredAssessments;
  const isEligible = data.eligibilityStatus === 'ELIGIBLE';

  return (
    <div className={cn('rounded-xl border border-border/60 bg-card p-5 shadow-sm', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Certificate Progress</h3>
          {courseTitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{courseTitle}</p>
          ) : null}
        </div>
        <Badge
          className={cn(
            isEligible
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
              : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50',
          )}
        >
          {isEligible ? 'Eligible' : 'Not Eligible'}
        </Badge>
      </div>

      <div className="space-y-2">
        <ProgressRow
          label="Course Completed"
          passed={data.courseCompleted}
          pending={!data.courseCompleted}
        />
        {certificateAssessments.map((item) => {
          const isPassed = item.status === 'PASSED';
          const isFailed = item.status === 'FAILED' || item.status === 'ATTEMPTS_EXHAUSTED';
          return (
            <ProgressRow
              key={item.assessmentId}
              label={assessmentProgressLabel(item)}
              passed={isPassed}
              pending={!isPassed && !isFailed}
            />
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Grade</p>
          <p className="mt-1 text-lg font-semibold">{formatPercent(data.overallGrade)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Certificate uses overall grade; individual fails are allowed when overall is passing.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Certificate Status</p>
          <p className="mt-1 text-sm font-medium">
            {isEligible ? 'Ready for certificate' : 'Not eligible yet'}
          </p>
        </div>
      </div>

      {data.reasons.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200/70 bg-amber-50/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Reason
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-950">
            {data.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
