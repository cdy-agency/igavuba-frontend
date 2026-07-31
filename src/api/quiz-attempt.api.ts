import { apiClient } from './api-client';
import type {
  QuizAttemptHistory,
  QuizAttemptMutationResponse,
  QuizAttemptStartPayload,
  QuizSubmitPayload,
  QuizSubmitResult,
} from '@/types/quiz-attempt';

export async function getMyQuizAttempts(quizId: string, courseId?: string) {
  const response = await apiClient.get<QuizAttemptMutationResponse<QuizAttemptHistory>>(
    `/quizzes/${quizId}/attempts/me`,
    { params: courseId ? { courseId } : undefined },
  );
  return response.data;
}

export async function startQuizAttempt(quizId: string, courseId?: string) {
  const response = await apiClient.post<QuizAttemptMutationResponse<QuizAttemptStartPayload>>(
    `/quizzes/${quizId}/start`,
    courseId ? { courseId } : {},
  );
  return response.data;
}

export async function submitQuizAttempt(
  quizId: string,
  payload: QuizSubmitPayload,
  courseId?: string,
) {
  const response = await apiClient.post<QuizAttemptMutationResponse<QuizSubmitResult>>(
    `/quizzes/${quizId}/submit`,
    payload,
    { params: courseId ? { courseId } : undefined },
  );
  return response.data;
}

export async function getQuizAttemptResult(
  quizId: string,
  attemptId: string,
  courseId?: string,
) {
  const response = await apiClient.get<
    QuizAttemptMutationResponse<
      QuizSubmitResult & { submittedAt?: string | null; message?: string }
    >
  >(`/quizzes/${quizId}/result/${attemptId}`, {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}
