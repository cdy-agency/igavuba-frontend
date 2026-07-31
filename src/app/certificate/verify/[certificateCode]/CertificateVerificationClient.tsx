'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  Loader2,
  Share2,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  IssuedCertificatePreview,
  getIssuedCertificatePreviewAspectRatio,
} from '@/components/certificate/issued-certificate-preview';
import { downloadCertificateByCode } from '@/lib/certificate-download';
import { certificatesApi } from '@/api/certificates.api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VerifyCertificateResponse } from '@/types/certificate';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatIssuedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

function MetaCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function CertificateVerificationClient() {
  const params = useParams();
  const certificateCode = params.certificateCode as string;

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['verify-certificate', certificateCode],
    queryFn: async () => {
      const response = await certificatesApi.verifyCertificate(certificateCode);
      return response.data as VerifyCertificateResponse;
    },
    enabled: !!certificateCode,
  });

  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/certificate/verify/${certificateCode}`
      : `/certificate/verify/${certificateCode}`;

  const handleDownload = async () => {
    if (!data?.template) {
      toast.error('Unable to download certificate PDF');
      return;
    }

    try {
      setIsDownloading(true);
      await downloadCertificateByCode(certificateCode, {
        template: data.template,
        context: {
          learnerName: data.learnerName,
          courseTitle: data.courseTitle,
          certificateCode: data.certificateCode,
          issuedAt: data.issuedAt,
          overallGrade: data.overallGrade,
          verifyUrl: verificationUrl,
          institutionName: data.institutionName,
        },
        fileName: `${certificateCode}.pdf`,
      });
      toast.success('Certificate downloaded');
    } catch {
      toast.error('Unable to download certificate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      toast.success('Verification link copied');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  const handleShareAward = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      void navigator
        .share({
          title: `${data?.learnerName} — ${data?.courseTitle}`,
          text: `Verified certificate for ${data?.courseTitle}`,
          url: verificationUrl,
        })
        .catch(() => undefined);
      return;
    }
    void handleCopyLink();
  };

  const handleShareToLinkedIn = () => {
    try {
      setIsSharing(true);
      const linkedInShareUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
      linkedInShareUrl.searchParams.set('url', verificationUrl);
      window.open(linkedInShareUrl.toString(), '_blank', 'width=600,height=600');
    } catch {
      toast.error('Failed to open LinkedIn share dialog');
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddToLinkedInProfile = () => {
    if (!data) return;

    const issued = new Date(data.issuedAt);
    const linkedInUrl = new URL('https://www.linkedin.com/profile/add');
    linkedInUrl.searchParams.set('startTask', 'CERTIFICATION_NAME');
    linkedInUrl.searchParams.set('name', data.courseTitle);
    linkedInUrl.searchParams.set('organizationName', data.institutionName ?? 'Iga Vuba');
    linkedInUrl.searchParams.set('issueYear', String(issued.getFullYear()));
    linkedInUrl.searchParams.set('issueMonth', String(issued.getMonth() + 1));
    linkedInUrl.searchParams.set('certUrl', verificationUrl);
    window.open(linkedInUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8]">
        <div className="text-center">
          <Award className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-gray-600">Certificate not found</p>
        </div>
      </div>
    );
  }

  const previewContext = {
    learnerName: data.learnerName,
    courseTitle: data.courseTitle,
    certificateCode: data.certificateCode,
    issuedAt: data.issuedAt,
    overallGrade: data.overallGrade,
    verifyUrl: verificationUrl,
    institutionName: data.institutionName,
  };

  const scoreLabel =
    data.overallGrade != null ? `${Math.round(data.overallGrade)}%` : 'Completed';

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            Iga Vuba Credentials
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Public verification
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-[#fafbfc] px-4 py-6 sm:px-8 sm:py-8">
            <div className="flex justify-center">
              {data.template ? (
                <IssuedCertificatePreview
                  ref={previewRef}
                  template={data.template}
                  context={previewContext}
                  maxWidth={920}
                  maxHeight={620}
                />
              ) : (
                <div
                  className="flex w-full max-w-4xl items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white"
                  style={{ aspectRatio: getIssuedCertificatePreviewAspectRatio('LANDSCAPE') }}
                >
                  <Award className="h-20 w-20 text-primary" strokeWidth={1.5} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-8">
            <div className="text-sm text-muted-foreground">
              Credential ID:{' '}
              <span className="font-mono font-semibold text-foreground">{data.certificateCode}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Distributed by:{' '}
              <span className="font-medium text-foreground">
                {data.institutionName ?? 'Iga Vuba'}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Issued to
              </p>

              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(data.learnerName) || <User className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{data.learnerName}</p>
                  <p className="text-sm text-muted-foreground">{data.courseTitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={handleShareAward}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share your award
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleAddToLinkedInProfile}
                >
                  Add to LinkedIn profile
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => void handleCopyLink()}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy link
                  </Button>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-teal-100 bg-teal-50/70 shadow-sm">
              <div className="border-b border-teal-100 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
                  Credential verification
                </p>
                <p className="mt-2 text-sm text-teal-900">
                  Issued {formatIssuedDate(data.issuedAt)}
                </p>
              </div>
              <div className="space-y-4 px-6 py-5">
                {data.valid ? (
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    This credential is verified
                  </div>
                ) : (
                  <div className="rounded-xl bg-white px-4 py-3 text-sm text-destructive">
                    This credential is no longer valid
                  </div>
                )}

                <Button
                  className="w-full bg-teal-700 hover:bg-teal-800"
                  onClick={handleShareToLinkedIn}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Share verification page
                </Button>

                <p className="font-mono text-xs text-teal-900">{data.certificateCode}</p>
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Issued by
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-foreground">
                      {data.institutionName ?? 'Iga Vuba'}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      This credential confirms successful completion of the course and validates the
                      learner&apos;s achievement through Iga Vuba&apos;s academic completion engine.
                    </p>
                  </div>
                </div>

                {data.valid ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    Verified
                  </Badge>
                ) : null}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetaCard icon={BookOpen} label="Type" value="Course" />
              <MetaCard icon={Award} label="Score" value={scoreLabel} />
              <MetaCard icon={GraduationCap} label="Format" value="Online" />
              <MetaCard
                icon={Clock}
                label="Issued"
                value={formatIssuedDate(data.issuedAt)}
              />
              <MetaCard
                icon={ShieldCheck}
                label="Template"
                value={data.template?.title ?? 'Default'}
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">{data.courseTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {data.learnerName} earned this credential on {formatLongDate(data.issuedAt)} after
                completing all required learning activities for {data.courseTitle}.
                {data.overallGrade != null
                  ? ` Overall grade: ${Math.round(data.overallGrade)}%.`
                  : null}
              </p>

              <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Awarded to
                  </p>
                  <p className="mt-1 font-medium text-foreground">{data.learnerName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Institution
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {data.institutionName ?? 'Iga Vuba'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
