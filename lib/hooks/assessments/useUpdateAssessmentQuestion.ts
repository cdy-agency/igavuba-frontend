'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssessmentQuestion } from '@/lib/api/assessments.api';

type UpdatePayload = {
  questionText?: string;
  type?: 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'ESSAY' | 'TEXT';
  options?: { text: string; isCorrect: boolean }[];
  marks?: number;
  order?: number;
};

export function useUpdateAssessmentQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      questionId,
      payload,
    }: {
      assessmentId: string;
      questionId: string;
      payload: UpdatePayload;
    }) => updateAssessmentQuestion(assessmentId, questionId, payload),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
    },
  });
}
