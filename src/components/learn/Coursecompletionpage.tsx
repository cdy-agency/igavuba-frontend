'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CertificateProgressContent } from '@/components/academic/certificate-progress-card';
import { IssuedCertificatePreview } from '@/components/certificate/issued-certificate-preview';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { RatingStars } from '@/components/reviews/RatingStars';
import { useCourseCertificateEligibility } from '@/hooks/use-academic';
import { useCourseCertificate, useIssueCourseCertificate } from '@/hooks/use-certificates';
import {
  useCreateOrUpdateReview,
  useReviewEligibility,
} from '@/hooks/use-reviews';
import { downloadCertificateByCode } from '@/lib/certificate-download';
import { getApiErrorMessage } from '@/lib/auth';
import type { IssuedCertificate } from '@/api/certificates.api';
import { cn } from '@/lib/utils';

interface CourseCompletionPageProps {
  courseId: string;
  courseSlug?: string;
  courseTitle: string;
  enrollmentId: string;
  userId: string;
  userName?: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value)}%`;
}

function IssuedCertificateCard({ certificate }: { certificate: IssuedCertificate }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const verifyPath = `/certificate/verify/${certificate.certificateCode}`;
  const verifyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${verifyPath}`
      : certificate.verifyUrl;

  const previewContext = {
    learnerName: certificate.learnerName,
    courseTitle: certificate.courseTitle,
    certificateCode: certificate.certificateCode,
    issuedAt: certificate.issuedAt,
    overallGrade: certificate.overallGrade,
    verifyUrl,
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(certificate.certificateCode);
    } catch {
      // clipboard unavailable
    }
  };

  const handleDownload = async () => {
    if (!certificate.template) {
      return;
    }

    try {
      await downloadCertificateByCode(certificate.certificateCode, {
        template: certificate.template,
        context: previewContext,
        fileName: `${certificate.certificateCode}.pdf`,
      });
    } catch {
      // no preview or export failed
    }
  };

  return (
    <div className="space-y-5">
      {certificate.template ? (
        <div className="overflow-hidden rounded-xl border border-border bg-[var(--primary-subtle)] p-4">
          <IssuedCertificatePreview
            ref={previewRef}
            template={certificate.template}
            context={previewContext}
            maxWidth={560}
            maxHeight={400}
          />
        </div>
      ) : null}

      <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,white)] px-4 py-3 text-sm text-foreground">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
        <p>Your certificate is ready. Share the verification code with employers or download a PDF copy.</p>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Certificate code
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-mono font-semibold text-foreground">{certificate.certificateCode}</p>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopyCode}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Issued on</p>
          <p className="mt-1 font-medium text-foreground">{formatDate(certificate.issuedAt)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Overall grade
          </p>
          <p className="mt-1 font-medium text-foreground">
            {formatPercent(certificate.overallGrade)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Course</p>
          <p className="mt-1 font-medium text-foreground">{certificate.courseTitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" asChild className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
          <Link href={verifyPath}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View certificate
          </Link>
        </Button>
        {certificate.template || certificate.pdfUrl ? (
          <Button type="button" variant="outline" onClick={() => void handleDownload()}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        ) : null}
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/achievements">View all achievements</Link>
        </Button>
      </div>
    </div>
  );
}

function CertificateClaimSection({
  courseIdOrSlug,
  courseTitle,
}: {
  courseIdOrSlug: string;
  courseTitle: string;
}) {
  const {
    data: eligibility,
    isPending: eligibilityPending,
    isError: eligibilityError,
  } = useCourseCertificateEligibility(courseIdOrSlug);
  const {
    data: certificate,
    isPending: certificatePending,
    isError: certificateError,
  } = useCourseCertificate(courseIdOrSlug);
  const issueCertificate = useIssueCourseCertificate(courseIdOrSlug);

  const isLoading = eligibilityPending || certificatePending;

  if (isLoading) {
    return (
      <div className="flex min-h-[120px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (eligibilityError || certificateError || !eligibility) {
    return (
      <p className="text-sm text-destructive">
        Unable to load certificate status. Please refresh the page and try again.
      </p>
    );
  }

  const issuedCertificate = certificate ?? issueCertificate.data ?? null;
  const canClaimCertificate =
    eligibility.eligibilityStatus === 'ELIGIBLE' && eligibility.pendingAssessments.length === 0;

  if (issuedCertificate) {
    return <IssuedCertificateCard certificate={issuedCertificate} />;
  }

  if (canClaimCertificate) {
    const issueError = issueCertificate.isError
      ? getApiErrorMessage(issueCertificate.error, 'Unable to claim certificate.')
      : issueCertificate.isSuccess && !issueCertificate.data
        ? 'Certificate was created but the response could not be loaded. Please refresh the page.'
        : null;

    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_8%,white)] px-4 py-3">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
            <div>
              <p className="text-sm font-semibold text-foreground">You are eligible</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Claim your certificate to get a unique verification code you can share with
                employers.
                {eligibility.overallGrade != null
                  ? ` Overall grade: ${formatPercent(eligibility.overallGrade)}.`
                  : ''}
              </p>
            </div>
          </div>
        </div>

        {issueError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {issueError}
          </div>
        ) : null}

        <Button
          type="button"
          size="lg"
          className="h-12 w-full bg-[var(--primary)] text-base font-semibold text-white hover:bg-[var(--primary-hover)] sm:w-auto sm:min-w-[240px]"
          disabled={issueCertificate.isPending}
          onClick={() => issueCertificate.mutate()}
        >
          {issueCertificate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Claiming certificate...
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Claim Certificate
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Finish the remaining requirements below, then you can claim your certificate.
      </p>
      <CertificateProgressContent data={eligibility} courseTitle={courseTitle} />
    </div>
  );
}

export function CourseCompletionPage({
  courseId,
  courseSlug,
  courseTitle,
  userName = 'Student',
}: CourseCompletionPageProps) {
  const courseIdOrSlug = courseSlug || courseId;
  const [reviewOpen, setReviewOpen] = useState(false);
  const autoPromptedRef = useRef(false);
  const { data: eligibility, isPending: eligibilityPending } = useReviewEligibility(
    courseIdOrSlug,
    true,
  );
  const saveReview = useCreateOrUpdateReview(courseIdOrSlug);
  const myReview = eligibility?.myReview ?? null;
  const hasReview = Boolean(eligibility?.hasReview || myReview);
  const canReview = Boolean(eligibility?.canReview);

  // Only auto-prompt when the learner can review and has not rated yet.
  useEffect(() => {
    if (autoPromptedRef.current || eligibilityPending || !eligibility) return;
    if (!canReview || hasReview) return;

    autoPromptedRef.current = true;
    setReviewOpen(true);
  }, [eligibilityPending, eligibility, canReview, hasReview]);

  return (
    <div className="h-full overflow-y-auto bg-[var(--surface)]">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--primary-muted)_0%,transparent_65%)]"
        />

        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-5 w-full max-w-[280px] sm:max-w-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Graduation-cuate.svg"
                alt=""
                width={500}
                height={500}
                className="mx-auto h-auto w-full drop-shadow-sm"
              />
            </div>

            <Badge className="mb-3 border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[var(--success)] hover:bg-[color-mix(in_srgb,var(--success)_12%,white)]">
              Course completed
            </Badge>

            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Congratulations, {userName}!
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              You have completed{' '}
              <span className="font-semibold text-foreground">{courseTitle}</span>.
            </p>
          </div>

          <div className="space-y-5">
            <section
              className={cn(
                'rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6',
                'text-left',
              )}
            >
              <div className="mb-4 space-y-1">
                <h2 className="text-lg font-semibold text-foreground">How would you rate this course?</h2>
                <p className="text-sm text-muted-foreground">
                  Your rating helps other learners find the right course.
                </p>
              </div>

              {canReview ? (
                <div className="space-y-4">
                  {myReview ? (
                    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4">
                      <RatingStars value={myReview.rating} size="md" />
                      <p className="text-[15px] font-semibold text-foreground">{myReview.title}</p>
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {myReview.comment}
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-center rounded-xl border border-dashed border-border bg-[var(--primary-subtle)] py-4">
                      <RatingStars
                        value={0}
                        size="xl"
                        interactive
                        onChange={() => setReviewOpen(true)}
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    className="h-11 w-full bg-[var(--primary)] font-semibold text-white hover:bg-[var(--primary-hover)] sm:w-auto"
                    onClick={() => setReviewOpen(true)}
                  >
                    {myReview ? 'Edit your review' : 'Leave a rating'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Finish all completion requirements to unlock course reviews.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-muted)]">
                  <Award className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Certificate</h2>
                  <p className="text-sm text-muted-foreground">
                    Claim and download your official course certificate.
                  </p>
                </div>
              </div>
              <CertificateClaimSection courseIdOrSlug={courseIdOrSlug} courseTitle={courseTitle} />
            </section>
          </div>
        </div>
      </div>

      <ReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        courseTitle={courseTitle}
        initialReview={myReview}
        submitting={saveReview.isPending}
        onSubmit={async (values) => {
          await saveReview.mutateAsync(values);
        }}
      />
    </div>
  );
}
