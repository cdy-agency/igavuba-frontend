'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssessmentById } from '@/lib/api/assessments.api';

export function useAssessmentById(assessmentId: string | undefined) {
  return useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getAssessmentById(assessmentId!),
    enabled: !!assessmentId,
  });
}
