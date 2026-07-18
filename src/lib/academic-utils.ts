import type {
  AssessmentSummaryItem,
  BlockedProgressDetails,
  CertificateEligibilityResult,
} from '@/types/academic.types';

const PROGRESS_BLOCK_PATTERNS = [
  /(.+) must be submitted before continuing/i,
  /(.+) must be attempted before continuing/i,
  /(.+) must be passed before continuing/i,
];

export function parseProgressBlockMessage(message: string | undefined) {
  if (!message) return null;

  for (const pattern of PROGRESS_BLOCK_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      return match[1]?.trim() ?? null;
    }
  }

  return null;
}

export function buildBlockedProgressDetails(
  assessmentTitle: string,
  eligibility?: CertificateEligibilityResult,
): BlockedProgressDetails {
  const assessment = eligibility?.requiredAssessments.find(
    (item) => item.title === assessmentTitle || item.title.includes(assessmentTitle),
  );

  return mapAssessmentToBlockedDetails(assessmentTitle, assessment);
}

export function mapAssessmentToBlockedDetails(
  assessmentTitle: string,
  assessment?: AssessmentSummaryItem,
): BlockedProgressDetails {
  const attemptsExhausted = assessment?.status === 'ATTEMPTS_EXHAUSTED';

  const awaitingReview = assessment?.status === 'AWAITING_REVIEW';

  return {
    assessmentTitle,
    assessmentContentId: assessment?.contentId,
    reason: awaitingReview
      ? `You can keep learning, but "${assessmentTitle}" must be graded before you can earn a certificate.`
      : `You must submit or attempt "${assessmentTitle}" before continuing.`,
    status: assessment?.status ?? 'FAILED',
    attemptsRemaining: attemptsExhausted ? 0 : null,
    currentScore: assessment?.percentage ?? null,
    passingScore: null,
    attemptsExhausted,
  };
}

export function getCertificateAssessmentItems(eligibility: CertificateEligibilityResult) {
  return eligibility.requiredAssessments.filter((item) => item.countsTowardCertificate);
}
