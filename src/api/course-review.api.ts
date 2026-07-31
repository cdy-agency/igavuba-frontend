import { apiClient } from './api-client';
import type { PaginatedResponse } from '@/types/pagination';
import type { CourseMutationResponse } from '@/types/course';
import type {
  CourseReviewComment,
  CourseReviewCommentsResponse,
  CourseReviewDetail,
  CourseReviewListQuery,
  CourseReviewQueueItem,
  CourseReviewRecord,
  ReviewCommentInput,
} from '@/types/course-review';
import type { CourseLifecycleStatus } from '@/types/course-status';

function toQueryRecord(params: CourseReviewListQuery): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  if (params.page) record.page = params.page;
  if (params.limit) record.limit = params.limit;
  if (params.search) record.search = params.search;
  if (params.status) record.status = params.status;
  return record;
}

export async function getCourseReviewQueue(params: CourseReviewListQuery = {}) {
  const response = await apiClient.get<PaginatedResponse<CourseReviewQueueItem>>(
    '/course-reviews',
    { params: toQueryRecord(params) },
  );
  return response.data;
}

export async function getCourseReviewDetail(courseId: string) {
  const response = await apiClient.get<CourseMutationResponse<CourseReviewDetail>>(
    `/course-reviews/${courseId}`,
  );
  return response.data;
}

export async function getCourseReviewHistory(courseId: string) {
  const response = await apiClient.get<CourseMutationResponse<CourseReviewRecord[]>>(
    `/course-reviews/${courseId}/history`,
  );
  return response.data;
}

export async function getCourseReviewComments(courseId: string) {
  const response = await apiClient.get<CourseMutationResponse<CourseReviewCommentsResponse>>(
    `/courses/${courseId}/review-comments`,
  );
  return response.data;
}

export async function submitCourseForReview(courseId: string) {
  const response = await apiClient.post<CourseMutationResponse<{ id: string; status: CourseLifecycleStatus }>>(
    `/courses/${courseId}/submit-review`,
  );
  return response.data;
}

export async function resubmitCourseForReview(courseId: string) {
  const response = await apiClient.post<CourseMutationResponse<{ id: string; status: CourseLifecycleStatus }>>(
    `/courses/${courseId}/resubmit`,
  );
  return response.data;
}

export async function approveCourseReview(courseId: string) {
  const response = await apiClient.patch<CourseMutationResponse<{ id: string; status: CourseLifecycleStatus }>>(
    `/courses/${courseId}/approve`,
  );
  return response.data;
}

export async function requestCourseChanges(courseId: string, comments: ReviewCommentInput[]) {
  const response = await apiClient.patch<CourseMutationResponse<{ id: string; status: CourseLifecycleStatus }>>(
    `/courses/${courseId}/request-changes`,
    { comments },
  );
  return response.data;
}

export async function resolveCourseReviewComment(
  courseId: string,
  commentId: string,
  note?: string,
) {
  const result = await apiClient.patch<CourseMutationResponse<CourseReviewComment>>(
    `/courses/${courseId}/review-comments/${commentId}/resolve`,
    note?.trim() ? { note: note.trim() } : {},
  );
  return result.data;
}
