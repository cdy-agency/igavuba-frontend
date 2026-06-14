import { apiClient } from './api-client';
import type {
  LearningCourse,
  LearningCourseApiResponse,
} from '@/types/learning';

export async function getLearningCourse(slug: string) {
  const response = await apiClient.get<LearningCourseApiResponse>(
    `/learn/courses/${slug}`,
  );
  return response.data.data;
}