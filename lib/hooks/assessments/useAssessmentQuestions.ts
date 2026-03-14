'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssessmentQuestionsForAttempt } from '@/lib/api/assessments.api';

export function useAssessmentQuestions(assessmentId: string | undefined) {
  return useQuery({
    queryKey: ['assessment-questions', assessmentId],
    queryFn: () => getAssessmentQuestionsForAttempt(assessmentId!),
    enabled: !!assessmentId,
  });
}
