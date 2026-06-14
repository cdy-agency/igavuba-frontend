import { apiClient } from './api-client';
import type {
  LearningCourse,
  LearningCourseApiResponse,
  MarkContentCompleteResponse,
} from '@/types/learning';

export async function getLearningCourse(slug: string) {
  const response = await apiClient.get<LearningCourseApiResponse>(
    `/learn/courses/${slug}`,
  );
  return response.data.data;
}

export async function markLearningContentComplete(
  slug: string,
  moduleContentId: string,
) {
  const response = await apiClient.post<MarkContentCompleteResponse>(
    `/learn/courses/${slug}/contents/${moduleContentId}/complete`,
  );
  return response.data.data;
}