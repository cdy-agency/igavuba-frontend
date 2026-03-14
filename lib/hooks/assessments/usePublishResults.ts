'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishAssessmentResults } from '@/lib/api/assessments.api';

export function usePublishResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => publishAssessmentResults(assessmentId),
    onSuccess: (result, assessmentId) => {
      if (result.ok && result.data?.course) {
        queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
        queryClient.invalidateQueries({ queryKey: ['assessments', result.data.course] });
      }
    },
  });
}
