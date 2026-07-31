import { apiClient } from './api-client';
import type {
  ExamDetail,
  ExamListItem,
  ExamMutationResponse,
  ExamSubmissionListItem,
} from '@/types/exam.types';
import type {
  CreateQuestionOptionPayload,
  CreateQuestionPayload,
  QuestionDeleteResponse,
  QuestionMutationResponse,
  QuestionOptionDeleteResponse,
  QuestionOptionMutationResponse,
  UpdateQuestionOptionPayload,
  UpdateQuestionPayload,
} from '@/types/question';
import type { AssessmentSettings } from '@/types/quiz';

export interface CreateExamPayload {
  title: string;
  description?: string;
  instructions?: string;
  settings?: Partial<AssessmentSettings>;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
  availableFrom?: string;
  availableTo?: string;
  isPublished?: boolean;
  institutionId?: string;
}

export interface UpdateExamPayload {
  title?: string;
  description?: string;
  instructions?: string;
  settings?: Partial<AssessmentSettings>;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number | null;
  availableFrom?: string | null;
  availableTo?: string | null;
  isPublished?: boolean;
  institutionId?: string;
}

export async function createExam(payload: CreateExamPayload) {
  const response = await apiClient.post<ExamMutationResponse>('/exams', payload);
  return response.data;
}

export interface ExamListResponse {
  success: boolean;
  message: string;
  data: ExamListItem[];
}

export async function listExams() {
  const response = await apiClient.get<ExamListResponse>('/exams');
  return response.data;
}

export async function getExam(examId: string) {
  const response = await apiClient.get<ExamMutationResponse>(`/exams/${examId}`);
  return response.data;
}

export async function updateExam(examId: string, payload: UpdateExamPayload) {
  const response = await apiClient.patch<ExamMutationResponse>(`/exams/${examId}`, payload);
  return response.data;
}

export async function deleteExam(examId: string) {
  const response = await apiClient.delete<ExamMutationResponse<{ id: string }>>(`/exams/${examId}`);
  return response.data;
}

export async function getExamSubmissions(examId: string) {
  const response = await apiClient.get<ExamMutationResponse<ExamSubmissionListItem[]>>(
    `/exams/${examId}/submissions`,
  );
  return response.data;
}

export async function getExamSubmission(attemptId: string) {
  const response = await apiClient.get<ExamMutationResponse>(`/exams/submissions/${attemptId}`);
  return response.data;
}

export async function gradeExamAnswer(
  answerId: string,
  payload: { score: number; feedback?: string },
) {
  const response = await apiClient.patch<ExamMutationResponse>(
    `/exams/answers/${answerId}/grade`,
    payload,
  );
  return response.data;
}

export async function publishExamResult(attemptId: string) {
  const response = await apiClient.patch<ExamMutationResponse>(
    `/exams/submissions/${attemptId}/publish`,
  );
  return response.data;
}

export async function publishAllExamResults(examId: string) {
  const response = await apiClient.patch<ExamMutationResponse<{ publishedCount: number }>>(
    `/exams/${examId}/publish-results`,
  );
  return response.data;
}

export async function createExamQuestion(
  examId: string,
  payload: CreateQuestionPayload & { instructions?: string },
) {
  const response = await apiClient.post<QuestionMutationResponse>(
    `/exams/${examId}/questions`,
    payload,
  );
  return response.data;
}

export async function updateExamQuestion(questionId: string, payload: UpdateQuestionPayload) {
  const response = await apiClient.patch<QuestionMutationResponse>(
    `/exam-questions/${questionId}`,
    payload,
  );
  return response.data;
}

export async function deleteExamQuestion(questionId: string) {
  const response = await apiClient.delete<QuestionDeleteResponse>(
    `/exam-questions/${questionId}`,
  );
  return response.data;
}

export async function createExamQuestionOption(
  questionId: string,
  payload: CreateQuestionOptionPayload,
) {
  const response = await apiClient.post<QuestionOptionMutationResponse>(
    `/exam-questions/${questionId}/options`,
    payload,
  );
  return response.data;
}

export async function updateExamQuestionOption(
  optionId: string,
  payload: UpdateQuestionOptionPayload,
) {
  const response = await apiClient.patch<QuestionOptionMutationResponse>(
    `/exam-options/${optionId}`,
    payload,
  );
  return response.data;
}

export async function deleteExamQuestionOption(optionId: string) {
  const response = await apiClient.delete<QuestionOptionDeleteResponse>(
    `/exam-options/${optionId}`,
  );
  return response.data;
}

export async function persistExamQuestions(
  examId: string,
  questions: Array<{
    title: string;
    type: CreateQuestionPayload['type'];
    instructions?: string;
    explanation?: string;
    points: number;
    order: number;
    options: Array<{ text: string; isCorrect: boolean; order: number }>;
  }>,
) {
  const createdQuestions = [];

  for (const question of questions) {
    const questionResponse = await createExamQuestion(examId, {
      title: question.title,
      type: question.type,
      instructions: question.instructions,
      explanation: question.explanation,
      points: question.points,
      order: question.order,
    });

    const createdQuestion = questionResponse.data;

    for (const option of question.options) {
      await createExamQuestionOption(createdQuestion.id, {
        text: option.text,
        isCorrect: option.isCorrect,
        order: option.order,
      });
    }

    createdQuestions.push(createdQuestion);
  }

  return createdQuestions;
}
