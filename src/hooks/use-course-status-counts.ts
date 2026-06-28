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
  includeNeedReview?: boolean;
  includeChangesRequested?: boolean;
}

export interface CourseStatusCounts {
  ALL: number;
  NEED_REVIEW: number;
  [CourseLifecycleStatus.CHANGES_REQUESTED]: number;
  [CourseLifecycleStatus.DRAFT]: number;
  [CourseLifecycleStatus.PUBLISHED]: number;
  [CourseLifecycleStatus.ARCHIVED]: number;
}

const EMPTY_COUNTS: CourseStatusCounts = {
  ALL: 0,
  NEED_REVIEW: 0,
  [CourseLifecycleStatus.CHANGES_REQUESTED]: 0,
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

  const queries = [
    {
      queryKey: courseQueryKeys.list({ ...base }),
      queryFn: () => getCourses(base),
    },
    ...(params.includeNeedReview
      ? [
          {
            queryKey: courseQueryKeys.list({
              ...base,
              status: CourseLifecycleStatus.UNDER_REVIEW,
            }),
            queryFn: () =>
              getCourses({ ...base, status: CourseLifecycleStatus.UNDER_REVIEW }),
          },
        ]
      : []),
    ...(params.includeChangesRequested
      ? [
          {
            queryKey: courseQueryKeys.list({
              ...base,
              status: CourseLifecycleStatus.CHANGES_REQUESTED,
            }),
            queryFn: () =>
              getCourses({
                ...base,
                status: CourseLifecycleStatus.CHANGES_REQUESTED,
              }),
          },
        ]
      : []),
    {
      queryKey: courseQueryKeys.list({
        ...base,
        status: CourseLifecycleStatus.DRAFT,
      }),
      queryFn: () => getCourses({ ...base, status: CourseLifecycleStatus.DRAFT }),
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
  ];

  const results = useQueries({ queries });

  const isLoading = results.some((result) => result.isPending);

  if (isLoading) {
    return { counts: EMPTY_COUNTS, isLoading: true };
  }

  let index = 1;
  const needReviewIndex = params.includeNeedReview ? index++ : null;
  const changesRequestedIndex = params.includeChangesRequested ? index++ : null;

  const counts: CourseStatusCounts = {
    ALL: results[0].data?.pagination.total ?? 0,
    NEED_REVIEW:
      needReviewIndex !== null
        ? (results[needReviewIndex].data?.pagination.total ?? 0)
        : 0,
    [CourseLifecycleStatus.CHANGES_REQUESTED]:
      changesRequestedIndex !== null
        ? (results[changesRequestedIndex].data?.pagination.total ?? 0)
        : 0,
    [CourseLifecycleStatus.DRAFT]: results[index++].data?.pagination.total ?? 0,
    [CourseLifecycleStatus.PUBLISHED]: results[index++].data?.pagination.total ?? 0,
    [CourseLifecycleStatus.ARCHIVED]: results[index++].data?.pagination.total ?? 0,
  };

  return { counts, isLoading: false };
}

export function getStatusCount(
  tab: CourseStatusTab,
  counts: CourseStatusCounts,
): number {
  if (tab === 'ALL') {
    return counts.ALL;
  }
  if (tab === 'NEED_REVIEW') {
    return counts.NEED_REVIEW;
  }
  if (tab in counts) {
    return counts[tab as keyof CourseStatusCounts];
  }
  return 0;
}
