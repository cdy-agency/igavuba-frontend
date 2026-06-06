import { apiClient } from './api-client';
import type {
  CourseSkill,
  CourseSkillDeleteResponse,
  CourseSkillMutationResponse,
  CreateCourseSkillPayload,
  UpdateCourseSkillPayload,
} from '@/types/course-skill';

export async function getCourseSkills(courseId: string) {
  const response = await apiClient.get<CourseSkill[]>(`/courses/${courseId}/skills`);
  return response.data;
}

export async function createCourseSkill(
  courseId: string,
  payload: CreateCourseSkillPayload,
) {
  const response = await apiClient.post<CourseSkillMutationResponse>(
    `/courses/${courseId}/skills`,
    payload,
  );
  return response.data;
}

export async function updateCourseSkill(
  courseId: string,
  skillId: string,
  payload: UpdateCourseSkillPayload,
) {
  const response = await apiClient.patch<CourseSkillMutationResponse>(
    `/courses/${courseId}/skills/${skillId}`,
    payload,
  );
  return response.data;
}

export async function deleteCourseSkill(courseId: string, skillId: string) {
  const response = await apiClient.delete<CourseSkillDeleteResponse>(
    `/courses/${courseId}/skills/${skillId}`,
  );
  return response.data;
}
