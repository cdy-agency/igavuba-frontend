'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssessmentSubmissions } from '@/lib/api/assessments.api';

export function useAssessmentSubmissions(assessmentId: string | undefined) {
  return useQuery({
    queryKey: ['assessment-submissions', assessmentId],
    queryFn: () => getAssessmentSubmissions(assessmentId!),
    enabled: !!assessmentId,
  });
}
