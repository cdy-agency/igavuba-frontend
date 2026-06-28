'use client';

import { useQuery } from '@tanstack/react-query';
import { getCourseLearnerResult, getCourseResults } from '@/api/course-results.api';
import type { CourseResultsQueryParams } from '@/types/course-results.types';

export const courseResultsQueryKeys = {
  course: (courseIdOrSlug: string, params?: CourseResultsQueryParams) =>
    ['course-results', courseIdOrSlug, params ?? {}] as const,
  learner: (courseIdOrSlug: string, learnerId: string) =>
    ['course-results', courseIdOrSlug, 'learner', learnerId] as const,
};

export function useCourseResults(
  courseIdOrSlug: string,
  params?: CourseResultsQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: courseResultsQueryKeys.course(courseIdOrSlug, params),
    queryFn: () => getCourseResults(courseIdOrSlug, params),
    enabled: Boolean(courseIdOrSlug) && enabled,
    select: (response) => response.data,
  });
}

export function useCourseLearnerResult(
  courseIdOrSlug: string,
  learnerId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: courseResultsQueryKeys.learner(courseIdOrSlug, learnerId),
    queryFn: () => getCourseLearnerResult(courseIdOrSlug, learnerId),
    enabled: Boolean(courseIdOrSlug) && Boolean(learnerId) && enabled,
    select: (response) => response.data,
  });
}
