'use client';

import { useQueries } from '@tanstack/react-query';
import { getCourses } from '@/api/course.api';
import { courseQueryKeys } from '@/hooks/use-courses';
import type { CourseListQueryParams } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import type { CourseStatusTab } from '@/components/dashboard/courses/course-status-tabs';

interface UseCourseStatusCountsParams {
  search?: string;
  level?: CourseListQueryParams['level'];
  departmentId?: string;
}

export interface CourseStatusCounts {
  ALL: number;
  [CourseLifecycleStatus.DRAFT]: number;
  [CourseLifecycleStatus.PUBLISHED]: number;
  [CourseLifecycleStatus.ARCHIVED]: number;
}

const EMPTY_COUNTS: CourseStatusCounts = {
  ALL: 0,
  [CourseLifecycleStatus.DRAFT]: 0,
  [CourseLifecycleStatus.PUBLISHED]: 0,
  [CourseLifecycleStatus.ARCHIVED]: 0,
};

function sharedFilters(params: UseCourseStatusCountsParams): CourseListQueryParams {
  return {
    limit: 1,
    page: 1,
    search: params.search || undefined,
    level: params.level,
    departmentId: params.departmentId || undefined,
  };
}

export function useCourseStatusCounts(params: UseCourseStatusCountsParams) {
  const base = sharedFilters(params);

  const results = useQueries({
    queries: [
      {
        queryKey: courseQueryKeys.list({ ...base }),
        queryFn: () => getCourses(base),
      },
      {
        queryKey: courseQueryKeys.list({
          ...base,
          status: CourseLifecycleStatus.DRAFT,
        }),
        queryFn: () =>
          getCourses({ ...base, status: CourseLifecycleStatus.DRAFT }),
      },
      {
        queryKey: courseQueryKeys.list({
          ...base,
          status: CourseLifecycleStatus.PUBLISHED,
        }),
        queryFn: () =>
          getCourses({ ...base, status: CourseLifecycleStatus.PUBLISHED }),
      },
      {
        queryKey: courseQueryKeys.list({
          ...base,
          status: CourseLifecycleStatus.ARCHIVED,
        }),
        queryFn: () =>
          getCourses({ ...base, status: CourseLifecycleStatus.ARCHIVED }),
      },
    ],
  });

  const isLoading = results.some((result) => result.isPending);

  if (isLoading) {
    return { counts: EMPTY_COUNTS, isLoading: true };
  }

  const counts: CourseStatusCounts = {
    ALL: results[0].data?.pagination.total ?? 0,
    [CourseLifecycleStatus.DRAFT]: results[1].data?.pagination.total ?? 0,
    [CourseLifecycleStatus.PUBLISHED]: results[2].data?.pagination.total ?? 0,
    [CourseLifecycleStatus.ARCHIVED]: results[3].data?.pagination.total ?? 0,
  };

  return { counts, isLoading: false };
}

export function getStatusCount(
  tab: CourseStatusTab,
  counts: CourseStatusCounts,
): number {
  return counts[tab] ?? 0;
}
