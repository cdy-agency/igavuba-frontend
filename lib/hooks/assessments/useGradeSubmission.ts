'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeAssessmentSubmission } from '@/lib/api/assessments.api';

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      manualScores,
      feedback,
    }: {
      submissionId: string;
      manualScores?: Array<{ answerId: string; manualScore: number }>;
      feedback?: string;
    }) => gradeAssessmentSubmission(submissionId, { manualScores, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-submissions'] });
    },
  });
}
