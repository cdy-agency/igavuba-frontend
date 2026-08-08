import { apiClient } from './api-client';
import { publicApiClient } from './public-api-client';
import type {
  CourseReview,
  CreateReviewPayload,
  ReviewAnalytics,
  ReviewEligibility,
  ReviewListParams,
  ReviewListResponse,
  ReviewSummary,
} from '@/types/review.types';

export async function getCourseReviews(
  courseIdOrSlug: string,
  params: ReviewListParams = {},
) {
  const response = await publicApiClient.get<{
    success: boolean;
    data: CourseReview[];
    pagination: ReviewListResponse['pagination'];
  }>(`/courses/${courseIdOrSlug}/reviews`, { params });

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  } satisfies ReviewListResponse;
}

export async function getCourseReviewSummary(courseIdOrSlug: string) {
  const response = await publicApiClient.get<{
    success: boolean;
    data: ReviewSummary;
  }>(`/courses/${courseIdOrSlug}/review-summary`);
  return response.data.data;
}

export async function getReviewEligibility(courseIdOrSlug: string) {
  const response = await apiClient.get<{
    success: boolean;
    data: ReviewEligibility;
  }>(`/courses/${courseIdOrSlug}/review-eligibility`);
  return response.data.data;
}

export async function createOrUpdateCourseReview(
  courseIdOrSlug: string,
  payload: CreateReviewPayload,
) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: CourseReview;
  }>(`/courses/${courseIdOrSlug}/reviews`, payload);
  return response.data;
}

export async function updateCourseReview(
  reviewId: string,
  payload: Partial<CreateReviewPayload>,
) {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
    data: CourseReview;
  }>(`/reviews/${reviewId}`, payload);
  return response.data;
}

export async function deleteCourseReview(reviewId: string) {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
  }>(`/reviews/${reviewId}`);
  return response.data;
}

export async function getMyReviews(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get<{
    success: boolean;
    data: CourseReview[];
    pagination: ReviewListResponse['pagination'];
  }>('/me/reviews', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  } satisfies ReviewListResponse;
}

export async function getReviewAnalytics(courseId?: string) {
  const response = await apiClient.get<{
    success: boolean;
    data: ReviewAnalytics | { summary: ReviewSummary; recentReviews: CourseReview[] };
  }>('/reviews/analytics', {
    params: courseId ? { courseId } : undefined,
  });
  return response.data.data;
}

export async function hideCourseReview(reviewId: string, reason?: string) {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
    data: CourseReview;
  }>(`/reviews/${reviewId}/hide`, { reason });
  return response.data;
}

export async function unhideCourseReview(reviewId: string) {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
    data: CourseReview;
  }>(`/reviews/${reviewId}/unhide`);
  return response.data;
}

export async function getModerationReviews(params?: {
  page?: number;
  limit?: number;
  includeHidden?: boolean;
}) {
  const response = await apiClient.get<{
    success: boolean;
    data: CourseReview[];
    pagination: ReviewListResponse['pagination'];
  }>('/reviews/moderation', {
    params: {
      page: params?.page,
      limit: params?.limit,
      includeHidden: params?.includeHidden ? 'true' : undefined,
    },
  });
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  } satisfies ReviewListResponse;
}
