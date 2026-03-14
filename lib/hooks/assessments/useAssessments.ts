'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssessmentsByCourse } from '@/lib/api/assessments.api';

export function useAssessments(courseId: string | undefined) {
  return useQuery({
    queryKey: ['assessments', courseId],
    queryFn: () => getAssessmentsByCourse(courseId!),
    enabled: !!courseId,
  });
}
