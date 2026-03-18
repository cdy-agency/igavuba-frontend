'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssessmentsByModule } from '@/lib/api/assessments.api';
import type { AssessmentWithAttemptStatus } from '@/lib/types/assessment-unified';

export function useAssessmentsByModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['assessments-module', moduleId],
    queryFn: () => getAssessmentsByModule(moduleId!),
    enabled: !!moduleId,
  });
}
