'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLearningCourse,
  markLearningContentComplete,
} from '@/api/learning.api';
import { enrollmentQueryKeys } from '@/hooks/use-enrollment';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import type { LearningCourse } from '@/types/learning';

export const learningQueryKeys = {
  course: (slug: string) => ['learning', 'course', slug] as const,
};

export function useLearningCourse(slug: string, enabled = true) {
  return useQuery<LearningCourse>({
    queryKey: learningQueryKeys.course(slug),
    queryFn: () => getLearningCourse(slug),
    enabled: Boolean(slug) && enabled,
    staleTime: 60_000,
  });
}

export function useMarkLearningContentComplete(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleContentId: string) =>
      markLearningContentComplete(slug, moduleContentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: learningQueryKeys.course(slug) });
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.my });
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.status(slug) });
      return result;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to mark this lesson as complete.'));
    },
  });
}
