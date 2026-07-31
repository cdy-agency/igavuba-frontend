'use client';

import { useQuery } from '@tanstack/react-query';
import { getLearningCourse } from '@/api/learning.api';
import type { LearningCourse } from '@/types/learning';

export const learningQueryKeys = {
  course: (slug: string) => ['learning', 'course', slug] as const,
};

export function useLearningCourse(
  slug: string,
  enabled = true,
  options?: { fresh?: boolean },
) {
  return useQuery<LearningCourse>({
    queryKey: learningQueryKeys.course(slug),
    queryFn: () => getLearningCourse(slug),
    enabled: Boolean(slug) && enabled,
    staleTime: options?.fresh ? 0 : 60_000,
    refetchOnMount: options?.fresh ? 'always' : true,
  });
}
