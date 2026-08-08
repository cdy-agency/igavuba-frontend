'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createOrUpdateCourseReview,
  deleteCourseReview,
  getCourseReviewSummary,
  getCourseReviews,
  getModerationReviews,
  getMyReviews,
  getReviewAnalytics,
  getReviewEligibility,
  hideCourseReview,
  unhideCourseReview,
  updateCourseReview,
} from '@/api/review.api';
import type {
  CreateReviewPayload,
  ReviewListParams,
} from '@/types/review.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useAuth } from '@/lib/hooks/use-auth';

export const reviewQueryKeys = {
  all: ['reviews'] as const,
  summary: (courseId: string) => ['reviews', 'summary', courseId] as const,
  list: (courseId: string, params: ReviewListParams) =>
    ['reviews', 'list', courseId, params] as const,
  infinite: (courseId: string, params: Omit<ReviewListParams, 'page'>) =>
    ['reviews', 'infinite', courseId, params] as const,
  eligibility: (courseId: string) => ['reviews', 'eligibility', courseId] as const,
  mine: ['reviews', 'mine'] as const,
  analytics: (courseId?: string) => ['reviews', 'analytics', courseId ?? 'scope'] as const,
  moderation: ['reviews', 'moderation'] as const,
};

export function useCourseReviewSummary(courseIdOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: reviewQueryKeys.summary(courseIdOrSlug),
    queryFn: () => getCourseReviewSummary(courseIdOrSlug),
    enabled: Boolean(courseIdOrSlug) && enabled,
  });
}

export function useInfiniteCourseReviews(
  courseIdOrSlug: string,
  params: Omit<ReviewListParams, 'page'> = {},
) {
  return useInfiniteQuery({
    queryKey: reviewQueryKeys.infinite(courseIdOrSlug, params),
    queryFn: ({ pageParam }) =>
      getCourseReviews(courseIdOrSlug, { ...params, page: pageParam, limit: params.limit ?? 8 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    enabled: Boolean(courseIdOrSlug),
  });
}

export function useReviewEligibility(courseIdOrSlug: string, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: reviewQueryKeys.eligibility(courseIdOrSlug),
    queryFn: () => getReviewEligibility(courseIdOrSlug),
    enabled: Boolean(courseIdOrSlug) && enabled && Boolean(user),
  });
}

export function useCreateOrUpdateReview(courseIdOrSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      createOrUpdateCourseReview(courseIdOrSlug, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Review saved');
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save review'));
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: Partial<CreateReviewPayload>;
    }) => updateCourseReview(reviewId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Review updated');
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update review'));
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteCourseReview(reviewId),
    onSuccess: (response) => {
      toast.success(response.message || 'Review deleted');
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete review'));
    },
  });
}

export function useMyReviews() {
  const { user } = useAuth();
  return useQuery({
    queryKey: reviewQueryKeys.mine,
    queryFn: () => getMyReviews({ page: 1, limit: 50 }),
    enabled: Boolean(user),
  });
}

export function useReviewAnalytics(courseId?: string, enabled = true) {
  return useQuery({
    queryKey: reviewQueryKeys.analytics(courseId),
    queryFn: () => getReviewAnalytics(courseId),
    enabled,
  });
}

export function useModerationReviews(includeHidden = true) {
  return useQuery({
    queryKey: [...reviewQueryKeys.moderation, includeHidden],
    queryFn: () => getModerationReviews({ page: 1, limit: 50, includeHidden }),
  });
}

export function useHideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason?: string }) =>
      hideCourseReview(reviewId, reason),
    onSuccess: () => {
      toast.success('Review hidden');
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to hide review'));
    },
  });
}

export function useUnhideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => unhideCourseReview(reviewId),
    onSuccess: () => {
      toast.success('Review restored');
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to restore review'));
    },
  });
}
