'use client';

import { useQuery } from '@tanstack/react-query';
import { getSubmissionById } from '@/lib/api/assessments.api';

export function useSubmissionById(submissionId: string | undefined) {
  return useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => getSubmissionById(submissionId!),
    enabled: !!submissionId,
  });
}
