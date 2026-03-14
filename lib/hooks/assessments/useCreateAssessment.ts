'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAssessment } from '@/lib/api/assessments.api';
type CreatePayload = Parameters<typeof createAssessment>[0];

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayload) => createAssessment(payload),
    onSuccess: (result, variables) => {
      if (result.ok && result.data?.course) {
        queryClient.invalidateQueries({ queryKey: ['assessments', result.data.course] });
      }
    },
  });
}
