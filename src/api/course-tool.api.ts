import { apiClient } from './api-client';
import type {
  CourseTool,
  CourseToolDeleteResponse,
  CourseToolMutationResponse,
  CreateCourseToolPayload,
  UpdateCourseToolPayload,
} from '@/types/course-tool';

export async function getCourseTools(courseId: string) {
  const response = await apiClient.get<CourseTool[]>(`/courses/${courseId}/tools`);
  return response.data;
}

export async function createCourseTool(
  courseId: string,
  payload: CreateCourseToolPayload,
) {
  const response = await apiClient.post<CourseToolMutationResponse>(
    `/courses/${courseId}/tools`,
    payload,
  );
  return response.data;
}

export async function updateCourseTool(
  courseId: string,
  toolId: string,
  payload: UpdateCourseToolPayload,
) {
  const response = await apiClient.patch<CourseToolMutationResponse>(
    `/courses/${courseId}/tools/${toolId}`,
    payload,
  );
  return response.data;
}

export async function deleteCourseTool(courseId: string, toolId: string) {
  const response = await apiClient.delete<CourseToolDeleteResponse>(
    `/courses/${courseId}/tools/${toolId}`,
  );
  return response.data;
}
