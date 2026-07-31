'use client';

import { useQuery } from '@tanstack/react-query';
import { getLearnerCertificateEligibility } from '@/api/academic.api';
import { GrantAttemptButton } from '@/components/academic/grant-attempt-dialog';
import type {
  AssessmentSummaryItem,
  CertificateEligibilityResult,
} from '@/types/academic.types';

type LearnerEligibilityCourse = { courseId: string; courseTitle: string } & CertificateEligibilityResult;

interface GrantAttemptActionsProps {
  assessmentId: string;
  learnerProfileId: string;
  learnerName?: string | null;
  assessmentTitle?: string;
  courseIdOrSlug?: string;
  enabled?: boolean;
}

export function GrantAttemptActions({
  assessmentId,
  learnerProfileId,
  learnerName,
  assessmentTitle,
  courseIdOrSlug,
  enabled = true,
}: GrantAttemptActionsProps) {
  const { data: courseEligibility } = useQuery({
    queryKey: ['academic', 'learner-eligibility', learnerProfileId, courseIdOrSlug ?? 'all'],
    queryFn: async () => {
      const response = await getLearnerCertificateEligibility(
        learnerProfileId,
        courseIdOrSlug,
      );
      return response.data;
    },
    enabled: enabled && Boolean(learnerProfileId),
    staleTime: 15_000,
  });

  const assessmentStatus = courseIdOrSlug
    ? courseEligibility?.courses[0]?.requiredAssessments.find(
        (item: AssessmentSummaryItem) => item.assessmentId === assessmentId,
      )?.status
    : courseEligibility?.courses
        .flatMap((course: LearnerEligibilityCourse) => course.requiredAssessments)
        .find((item: AssessmentSummaryItem) => item.assessmentId === assessmentId)?.status;

  const showGrantButton = assessmentStatus === 'ATTEMPTS_EXHAUSTED';

  return (
    <GrantAttemptButton
      assessmentId={assessmentId}
      learnerProfileId={learnerProfileId}
      learnerName={learnerName}
      assessmentTitle={assessmentTitle}
      courseIdOrSlug={courseIdOrSlug}
      visible={showGrantButton}
    />
  );
}
