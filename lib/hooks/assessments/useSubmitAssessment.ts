'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitAssessment } from '@/lib/api/assessments.api';
import type { AssessmentAnswerPayload } from '@/lib/types/assessment-unified';

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      answers,
    }: {
      assessmentId: string;
      answers: AssessmentAnswerPayload[];
    }) => submitAssessment(assessmentId, { answers }),
    onSuccess: (result, { assessmentId }) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
        queryClient.invalidateQueries({ queryKey: ['assessment-questions', assessmentId] });
        queryClient.invalidateQueries({ queryKey: ['assessment-submissions', assessmentId] });
      }
    },
  });
}
