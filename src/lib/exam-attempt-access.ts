import type { LearningExamContent } from '@/types/exam-attempt';

export function formatExamScheduleDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getExamAvailabilityBlockReason(
  examMeta: Pick<LearningExamContent, 'availableFrom' | 'availableTo'>,
  now = Date.now(),
): string | null {
  if (examMeta.availableFrom) {
    const opensAt = new Date(examMeta.availableFrom).getTime();
    if (!Number.isNaN(opensAt) && now < opensAt) {
      return `This exam is not open yet. It becomes available on ${formatExamScheduleDate(examMeta.availableFrom)}.`;
    }
  }

  if (examMeta.availableTo) {
    const closesAt = new Date(examMeta.availableTo).getTime();
    if (!Number.isNaN(closesAt) && now > closesAt) {
      return `This exam is closed. The attempt window ended on ${formatExamScheduleDate(examMeta.availableTo)}.`;
    }
  }

  return null;
}

export type ExamAttemptBlockReason = {
  code:
    | 'PAYMENT_LOCKED'
    | 'MODULES_INCOMPLETE'
    | 'NOT_AVAILABLE_YET'
    | 'NO_LONGER_AVAILABLE'
    | 'ALREADY_PASSED'
    | 'UNDER_REVIEW'
    | 'NO_ATTEMPTS_LEFT'
    | 'UNKNOWN';
  message: string;
};
