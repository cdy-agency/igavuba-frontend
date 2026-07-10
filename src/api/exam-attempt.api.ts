import { apiClient } from './api-client';
import type {
  ExamAttemptMutationResponse,
  ExamAttemptStartPayload,
  ExamPublishedResult,
  ExamSubmitPayload,
  ExamSubmitResult,
} from '@/types/exam-attempt';

export async function getMyExamAttempts(examId: string, courseId?: string) {
  const response = await apiClient.get<
    ExamAttemptMutationResponse & {
      data: Array<{
        id: string;
        status: string;
        startedAt: string;
        submittedAt: string | null;
        publishedAt: string | null;
        percentage: number | null;
        passed: boolean | null;
      }>;
      exam: { id: string; maxAttempts: number };
    }
  >(`/exams/${examId}/attempts/me`, {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}

export async function startExamAttempt(examId: string, courseId?: string) {
  const response = await apiClient.post<ExamAttemptMutationResponse<ExamAttemptStartPayload>>(
    `/exams/${examId}/start`,
    {},
    { params: courseId ? { courseId } : undefined },
  );
  return response.data;
}

export async function submitExamAttempt(
  examId: string,
  payload: ExamSubmitPayload,
  courseId?: string,
) {
  const response = await apiClient.post<ExamAttemptMutationResponse<ExamSubmitResult>>(
    `/exams/${examId}/submit`,
    payload,
    { params: courseId ? { courseId } : undefined },
  );
  return response.data;
}

export async function getExamAttemptResult(
  examId: string,
  attemptId: string,
  courseId?: string,
) {
  const response = await apiClient.get<
    ExamAttemptMutationResponse<
      ExamPublishedResult | { attemptId: string; status: string; message: string }
    >
  >(`/exams/${examId}/result/${attemptId}`, {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}
