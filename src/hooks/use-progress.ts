'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeContentProgress,
  getCourseProgress,
  getCourseResumeProgress,
  getMyProgress,
  startContentProgress,
} from '@/api/progress.api';
import { enrollmentQueryKeys } from '@/hooks/use-enrollment';
import { learningQueryKeys } from '@/hooks/use-learning';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const progressQueryKeys = {
  my: ['progress', 'my'] as const,
  course: (courseId: string) => ['progress', 'course', courseId] as const,
  resume: (courseId: string) => ['progress', 'resume', courseId] as const,
};

function invalidateProgressQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
  courseSlug?: string,
) {
  queryClient.invalidateQueries({ queryKey: progressQueryKeys.my });
  queryClient.invalidateQueries({ queryKey: progressQueryKeys.course(courseId) });
  queryClient.invalidateQueries({ queryKey: progressQueryKeys.resume(courseId) });
  queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.my });
  queryClient.invalidateQueries({ queryKey: ['enrollments', 'status'] });
  if (courseSlug) {
    queryClient.invalidateQueries({ queryKey: learningQueryKeys.course(courseSlug) });
  }
}

export function useMyProgress(enabled = true) {
  return useQuery({
    queryKey: progressQueryKeys.my,
    queryFn: getMyProgress,
    enabled,
    staleTime: 30_000,
  });
}

export function useCourseProgress(courseId: string, enabled = true) {
  return useQuery({
    queryKey: progressQueryKeys.course(courseId),
    queryFn: () => getCourseProgress(courseId),
    enabled: Boolean(courseId) && enabled,
    staleTime: 30_000,
  });
}

export function useCourseResumeProgress(courseId: string, enabled = true) {
  return useQuery({
    queryKey: progressQueryKeys.resume(courseId),
    queryFn: () => getCourseResumeProgress(courseId),
    enabled: Boolean(courseId) && enabled,
    staleTime: 15_000,
  });
}

export function useStartContentProgress(courseId: string, courseSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => startContentProgress(contentId, courseId),
    onSuccess: () => {
      invalidateProgressQueries(queryClient, courseId, courseSlug);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to record lesson start.'));
    },
  });
}

export function useCompleteContentProgress(courseId: string, courseSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => completeContentProgress(contentId, courseId),
    onSuccess: () => {
      invalidateProgressQueries(queryClient, courseId, courseSlug);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to mark lesson as complete.'));
    },
  });
}
