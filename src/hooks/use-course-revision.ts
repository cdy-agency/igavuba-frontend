'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveCourseRevision,
  getCourseRevisionComments,
  getCourseRevisionCompare,
  getCourseRevisionQueue,
  requestCourseRevisionChanges,
  resubmitCourseRevision,
  startCourseRevision,
  submitCourseRevision,
} from '@/api/course-revision.api';
import type { CourseRevisionListQuery } from '@/types/course-revision';
import type { ReviewCommentInput } from '@/types/course-review';
import { courseQueryKeys } from '@/hooks/use-courses';
import { courseReviewQueryKeys } from '@/hooks/use-course-review';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const courseRevisionQueryKeys = {
  all: ['course-revisions'] as const,
  queue: (params: CourseRevisionListQuery) => ['course-revisions', 'queue', params] as const,
  compare: (courseId: string) => ['course-revisions', 'compare', courseId] as const,
  comments: (courseId: string) => ['course-revisions', 'comments', courseId] as const,
};

function invalidateRevisionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId?: string,
) {
  queryClient.invalidateQueries({ queryKey: courseRevisionQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: courseReviewQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
  if (courseId) {
    queryClient.invalidateQueries({ queryKey: courseRevisionQueryKeys.compare(courseId) });
    queryClient.invalidateQueries({ queryKey: courseRevisionQueryKeys.comments(courseId) });
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseId) });
    queryClient.invalidateQueries({ queryKey: courseReviewQueryKeys.history(courseId) });
  }
}

export function useCourseRevisionQueue(params: CourseRevisionListQuery, enabled = true) {
  return useQuery({
    queryKey: courseRevisionQueryKeys.queue(params),
    queryFn: () => getCourseRevisionQueue(params),
    enabled,
  });
}

export function useCourseRevisionCompare(courseId: string, enabled = true) {
  return useQuery({
    queryKey: courseRevisionQueryKeys.compare(courseId),
    queryFn: () => getCourseRevisionCompare(courseId),
    enabled: Boolean(courseId) && enabled,
    select: (response) => response.data,
  });
}

export function useCourseRevisionComments(courseId: string, enabled = true) {
  return useQuery({
    queryKey: courseRevisionQueryKeys.comments(courseId),
    queryFn: () => getCourseRevisionComments(courseId),
    enabled: Boolean(courseId) && enabled,
    select: (response) => response.data,
  });
}

export function useStartCourseRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => startCourseRevision(courseId),
    onSuccess: (response, courseId) => {
      toast.success(response.message || 'Draft revision started.');
      invalidateRevisionQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to start draft revision.'));
    },
  });
}

export function useSubmitCourseRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => submitCourseRevision(courseId),
    onSuccess: (response, courseId) => {
      toast.success(response.message || 'Revision submitted for review.');
      invalidateRevisionQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to submit revision.'));
    },
  });
}

export function useResubmitCourseRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => resubmitCourseRevision(courseId),
    onSuccess: (response, courseId) => {
      toast.success(response.message || 'Revision resubmitted successfully.');
      invalidateRevisionQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to resubmit revision.'));
    },
  });
}

export function useApproveCourseRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => approveCourseRevision(courseId),
    onSuccess: (response, courseId) => {
      toast.success(response.message || 'Revision approved and published.');
      invalidateRevisionQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to approve revision.'));
    },
  });
}

export function useRequestCourseRevisionChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      comments,
    }: {
      courseId: string;
      comments: ReviewCommentInput[];
    }) => requestCourseRevisionChanges(courseId, comments),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Revision changes requested.');
      invalidateRevisionQueries(queryClient, variables.courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to request revision changes.'));
    },
  });
}
