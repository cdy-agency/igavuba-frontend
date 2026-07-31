'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveCourseReview,
  getCourseReviewComments,
  getCourseReviewDetail,
  getCourseReviewHistory,
  getCourseReviewQueue,
  requestCourseChanges,
  resolveCourseReviewComment,
  resubmitCourseForReview,
  submitCourseForReview,
} from '@/api/course-review.api';
import type { CourseReviewListQuery, ReviewCommentInput } from '@/types/course-review';
import { courseQueryKeys } from '@/hooks/use-courses';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const courseReviewQueryKeys = {
  all: ['course-reviews'] as const,
  queue: (params: CourseReviewListQuery) => ['course-reviews', 'queue', params] as const,
  detail: (courseId: string) => ['course-reviews', 'detail', courseId] as const,
  history: (courseId: string) => ['course-reviews', 'history', courseId] as const,
  comments: (courseId: string) => ['course-reviews', 'comments', courseId] as const,
};

export function useCourseReviewQueue(params: CourseReviewListQuery, enabled = true) {
  return useQuery({
    queryKey: courseReviewQueryKeys.queue(params),
    queryFn: () => getCourseReviewQueue(params),
    enabled,
  });
}

export function useCourseReviewDetail(courseId: string, enabled = true) {
  return useQuery({
    queryKey: courseReviewQueryKeys.detail(courseId),
    queryFn: () => getCourseReviewDetail(courseId),
    enabled: Boolean(courseId) && enabled,
    select: (response) => response.data,
  });
}

export function useCourseReviewHistory(courseId: string, enabled = true) {
  return useQuery({
    queryKey: courseReviewQueryKeys.history(courseId),
    queryFn: () => getCourseReviewHistory(courseId),
    enabled: Boolean(courseId) && enabled,
    select: (response) => response.data,
  });
}

export function useCourseReviewComments(courseId: string, enabled = true) {
  return useQuery({
    queryKey: courseReviewQueryKeys.comments(courseId),
    queryFn: () => getCourseReviewComments(courseId),
    enabled: Boolean(courseId) && enabled,
    select: (response) => response.data,
  });
}

function invalidateReviewQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId?: string,
) {
  queryClient.invalidateQueries({ queryKey: courseReviewQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
  if (courseId) {
    queryClient.invalidateQueries({ queryKey: courseReviewQueryKeys.detail(courseId) });
    queryClient.invalidateQueries({ queryKey: courseReviewQueryKeys.history(courseId) });
    queryClient.invalidateQueries({ queryKey: courseReviewQueryKeys.comments(courseId) });
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseId) });
  }
}

export function useSubmitCourseForReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => submitCourseForReview(courseId),
    onSuccess: (response, courseId) => {
      toast.success(response.message || 'Course submitted for review successfully.');
      invalidateReviewQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to submit course for review.'));
    },
  });
}

export function useResubmitCourseForReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => resubmitCourseForReview(courseId),
    onSuccess: (response, courseId) => {
      toast.success(response.message || 'Course resubmitted successfully.');
      invalidateReviewQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to resubmit course.'));
    },
  });
}

export function useApproveCourseReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => approveCourseReview(courseId),
    onSuccess: (response, courseId) => {
      toast.success(response.message || 'Course approved successfully.');
      invalidateReviewQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to approve course.'));
    },
  });
}

export function useRequestCourseChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      comments,
    }: {
      courseId: string;
      comments: ReviewCommentInput[];
    }) => requestCourseChanges(courseId, comments),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Changes requested successfully.');
      invalidateReviewQueries(queryClient, variables.courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to request changes.'));
    },
  });
}

export function useResolveCourseReviewComment(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      response,
    }: {
      commentId: string;
      response: string;
    }) => resolveCourseReviewComment(courseId, commentId, response),
    onSuccess: () => {
      toast.success('Reply sent.');
      invalidateReviewQueries(queryClient, courseId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to send reply.'));
    },
  });
}
