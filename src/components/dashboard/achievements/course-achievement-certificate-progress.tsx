'use client';

import { CertificateProgressCard } from '@/components/academic/certificate-progress-card';

export function CourseAchievementCertificateProgress({
  courseSlug,
  courseTitle,
}: {
  courseSlug: string;
  courseTitle: string;
}) {
  return (
    <CertificateProgressCard courseIdOrSlug={courseSlug} courseTitle={courseTitle} className="mt-4" />
  );
}
