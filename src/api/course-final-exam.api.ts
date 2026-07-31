import { apiClient } from './api-client';

export interface CourseFinalExamRecord {
  id: string;
  courseId: string;
  contentId: string;
  revisionWorkspaceId: string;
  isLive: boolean;
  content: {
    id: string;
    title: string;
    description: string | null;
    isPublished: boolean;
    type: string;
    examId: string | null;
    questionsCount: number;
    passingScore: number;
    maxAttempts: number;
    timeLimitMinutes: number | null;
  };
}

export interface CourseFinalExamResponse {
  success: boolean;
  message: string;
  data: CourseFinalExamRecord | null;
}

export async function getCourseFinalExam(courseId: string) {
  const response = await apiClient.get<CourseFinalExamResponse>(
    `/courses/${courseId}/final-exam`,
  );
  return response.data;
}

export async function setCourseFinalExam(courseId: string, contentId: string) {
  const response = await apiClient.put<CourseFinalExamResponse>(
    `/courses/${courseId}/final-exam`,
    { contentId },
  );
  return response.data;
}

export async function removeCourseFinalExam(courseId: string) {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/courses/${courseId}/final-exam`,
  );
  return response.data;
}
