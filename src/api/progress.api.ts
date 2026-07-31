import { apiClient } from './api-client';
import type {
  CompleteContentProgressApiResponse,
  CourseProgressApiResponse,
  MyProgressApiResponse,
  ResumeProgressApiResponse,
  StartContentProgressApiResponse,
} from '@/types/progress';

export async function startContentProgress(contentId: string, courseId: string) {
  const response = await apiClient.post<StartContentProgressApiResponse>(
    `/progress/content/${contentId}/start`,
    undefined,
    { params: { courseId } },
  );
  return response.data.data;
}

export async function completeContentProgress(contentId: string, courseId: string) {
  const response = await apiClient.post<CompleteContentProgressApiResponse>(
    `/progress/content/${contentId}/complete`,
    undefined,
    { params: { courseId } },
  );
  return response.data.data;
}

export async function getCourseProgress(courseId: string) {
  const response = await apiClient.get<CourseProgressApiResponse>(
    `/progress/courses/${courseId}`,
  );
  return response.data.data;
}

export async function getMyProgress() {
  const response = await apiClient.get<MyProgressApiResponse>('/progress/my');
  return response.data.data;
}

export async function getCourseResumeProgress(courseId: string) {
  const response = await apiClient.get<ResumeProgressApiResponse>(
    `/progress/courses/${courseId}/resume`,
  );
  return response.data.data;
}
