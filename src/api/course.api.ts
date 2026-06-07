import { apiClient } from './api-client';
import type { PaginatedResponse } from '@/types/pagination';
import type { CourseLifecycleStatus } from '@/types/course-status';
import type {
  Course,
  CourseListQueryParams,
  CourseMutationResponse,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '@/types/course';

function toQueryRecord(
  params: CourseListQueryParams,
): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  if (params.page) record.page = params.page;
  if (params.limit) record.limit = params.limit;
  if (params.search) record.search = params.search;
  if (params.status) record.status = params.status;
  if (params.level) record.level = params.level;
  if (params.departmentId) record.departmentId = params.departmentId;
  return record;
}

export async function getCourses(params: CourseListQueryParams = {}) {
  const response = await apiClient.get<PaginatedResponse<Course>>('/courses', {
    params: toQueryRecord(params),
  });
  return response.data;
}

export async function getCourse(idOrSlug: string) {
  const response = await apiClient.get<CourseMutationResponse>(`/courses/${idOrSlug}`);
  return response.data;
}

export async function createCourse(payload: CreateCoursePayload) {
  const response = await apiClient.post<CourseMutationResponse>('/courses', payload);
  return response.data;
}

export async function updateCourse(idOrSlug: string, payload: UpdateCoursePayload) {
  const response = await apiClient.patch<CourseMutationResponse>(
    `/courses/${idOrSlug}`,
    payload,
  );
  return response.data;
}

export async function updateCourseStatus(courseId: string, status: CourseLifecycleStatus) {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
    courseId: string;
    status: CourseLifecycleStatus;
  }>(`/courses/${courseId}/status`, { status });
  return response.data;
}

export async function permanentlyDeleteCourse(courseId: string) {
  const response = await apiClient.delete<{ message: string }>(
    `/courses/${courseId}/permanent`,
  );
  return response.data;
}
