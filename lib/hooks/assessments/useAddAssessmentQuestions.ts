'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addAssessmentQuestions } from '@/lib/api/assessments.api';

type NewQuestion = {
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'ESSAY' | 'TEXT';
  options?: { text: string; isCorrect: boolean }[];
  marks: number;
  order?: number;
};

export function useAddAssessmentQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, questions }: { assessmentId: string; questions: NewQuestion[] }) =>
      addAssessmentQuestions(assessmentId, questions),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
    },
  });
}
