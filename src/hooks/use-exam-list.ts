'use client';

import { useQuery } from '@tanstack/react-query';
import { listExams } from '@/api/exam.api';
import type { ExamListItem } from '@/types/exam.types';

export const examListQueryKeys = {
  all: ['exam-list'] as const,
  list: () => ['exam-list', 'items'] as const,
};

export function useExamList(enabled = true) {
  return useQuery<ExamListItem[]>({
    queryKey: examListQueryKeys.list(),
    queryFn: async () => {
      const response = await listExams();
      if (!response.success) {
        throw new Error(response.message || 'Unable to load exams');
      }
      return response.data ?? [];
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
}
