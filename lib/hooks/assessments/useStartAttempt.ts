'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startAssessmentAttempt } from '@/lib/api/assessments.api';

export function useStartAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => startAssessmentAttempt(assessmentId),
    onSuccess: (result, assessmentId) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['assessment-questions', assessmentId] });
      }
    },
  });
}
