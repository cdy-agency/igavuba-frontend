'use client';

import Link from 'next/link';
import { useRef } from 'react';
import {
  Award,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificateProgressContent } from '@/components/academic/certificate-progress-card';
import { IssuedCertificatePreview } from '@/components/certificate/issued-certificate-preview';
import { useCourseCertificateEligibility } from '@/hooks/use-academic';
import { useCourseCertificate, useIssueCourseCertificate } from '@/hooks/use-certificates';
import { downloadCertificateByCode } from '@/lib/certificate-download';
import { getApiErrorMessage } from '@/lib/auth';
import type { IssuedCertificate } from '@/api/certificates.api';

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
    <div className="space-y-4">
      {certificate.template ? (
        <div className="overflow-hidden rounded-lg border bg-gray-50 p-3">
          <IssuedCertificatePreview
            ref={previewRef}
            template={certificate.template}
            context={previewContext}
            maxWidth={560}
            maxHeight={400}
          />
        </div>
      ) : null}

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Your certificate has been generated and is ready to view or share.</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Certificate code</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-mono font-semibold">{certificate.certificateCode}</p>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopyCode}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Issued on</p>
          <p className="mt-1 font-medium">{formatDate(certificate.issuedAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall grade</p>
          <p className="mt-1 font-medium">{formatPercent(certificate.overallGrade)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Course</p>
          <p className="mt-1 font-medium">{certificate.courseTitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" asChild>
          <Link href={verifyPath}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View certificate
          </Link>
        </Button>
        {(certificate.template || certificate.pdfUrl) ? (
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
  const canGenerateCertificate =
    eligibility.eligibilityStatus === 'ELIGIBLE' &&
    eligibility.pendingAssessments.length === 0 &&
    eligibility.requiredAssessments.every((item) => item.status === 'PASSED');

  if (issuedCertificate) {
    return <IssuedCertificateCard certificate={issuedCertificate} />;
  }

  if (canGenerateCertificate) {
    const issueError = issueCertificate.isError
      ? getApiErrorMessage(issueCertificate.error, 'Unable to generate certificate.')
      : issueCertificate.isSuccess && !issueCertificate.data
        ? 'Certificate was created but the response could not be loaded. Please refresh the page.'
        : null;

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You meet all requirements for this course. Generate your certificate now to receive a
          unique verification code you can share with employers.
        </p>

        {issueError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {issueError}
          </div>
        ) : null}

        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={issueCertificate.isPending}
          onClick={() => issueCertificate.mutate()}
        >
          {issueCertificate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating certificate...
            </>
          ) : (
            'Generate my certificate'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Complete the remaining requirements below before you can generate your certificate.
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

  return (
    <div className="h-full overflow-y-auto dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Congratulations, {userName}!
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
          You have completed <span className="font-semibold">{courseTitle}</span>.
        </p>

        <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 text-left dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold dark:text-white">Rate this course</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Course ratings will be available in a future update.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 text-left dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold dark:text-white">Certificate</h2>
          </div>
          <CertificateClaimSection courseIdOrSlug={courseIdOrSlug} courseTitle={courseTitle} />
        </div>
      </div>
    </div>
  );
}
