import { apiClient } from './api-client';
import type { PaginatedResponse } from '@/types/pagination';
import type { CourseMutationResponse } from '@/types/course';
import type {
  CourseRevisionCompareResponse,
  CourseRevisionCommentsResponse,
  CourseRevisionListQuery,
  CourseRevisionQueueItem,
  CourseRevisionStatus,
} from '@/types/course-revision';
import type { ReviewCommentInput } from '@/types/course-review';

function toQueryRecord(params: CourseRevisionListQuery): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  if (params.page) record.page = params.page;
  if (params.limit) record.limit = params.limit;
  if (params.search) record.search = params.search;
  if (params.status) record.status = params.status;
  return record;
}

export async function getCourseRevisionQueue(params: CourseRevisionListQuery = {}) {
  const response = await apiClient.get<PaginatedResponse<CourseRevisionQueueItem>>(
    '/course-revisions',
    { params: toQueryRecord(params) },
  );
  return response.data;
}

export async function getCourseRevisionCompare(courseId: string) {
  const response = await apiClient.get<CourseMutationResponse<CourseRevisionCompareResponse>>(
    `/courses/${courseId}/revision/compare`,
  );
  return response.data;
}

export async function getCourseRevisionComments(courseId: string) {
  const response = await apiClient.get<CourseMutationResponse<CourseRevisionCommentsResponse>>(
    `/courses/${courseId}/revision-comments`,
  );
  return response.data;
}

export async function startCourseRevision(courseId: string) {
  const response = await apiClient.post<
    CourseMutationResponse<{
      id: string;
      hasUnpublishedChanges: boolean;
      revisionStatus: CourseRevisionStatus;
      activeRevisionWorkspaceId: string;
    }>
  >(`/courses/${courseId}/start-revision`);
  return response.data;
}

export async function submitCourseRevision(courseId: string) {
  const response = await apiClient.post<
    CourseMutationResponse<{
      id: string;
      status: string;
      revisionStatus: CourseRevisionStatus;
      hasUnpublishedChanges: boolean;
    }>
  >(`/courses/${courseId}/submit-revision`);
  return response.data;
}

export async function resubmitCourseRevision(courseId: string) {
  const response = await apiClient.post<
    CourseMutationResponse<{ id: string; revisionStatus: CourseRevisionStatus }>
  >(`/courses/${courseId}/resubmit-revision`);
  return response.data;
}

export async function discardCourseRevision(courseId: string) {
  const response = await apiClient.post<
    CourseMutationResponse<{
      id: string;
      status: string;
      hasUnpublishedChanges: boolean;
      revisionStatus: null;
    }>
  >(`/courses/${courseId}/discard-revision`);
  return response.data;
}

export async function approveCourseRevision(courseId: string) {
  const response = await apiClient.patch<
    CourseMutationResponse<{
      id: string;
      status: string;
      hasUnpublishedChanges: boolean;
      revisionStatus: null;
      publishedAt: string;
    }>
  >(`/courses/${courseId}/approve-revision`);
  return response.data;
}

export async function requestCourseRevisionChanges(
  courseId: string,
  comments: ReviewCommentInput[],
) {
  const response = await apiClient.patch<
    CourseMutationResponse<{ id: string; revisionStatus: CourseRevisionStatus }>
  >(`/courses/${courseId}/request-revision-changes`, { comments });
  return response.data;
}
