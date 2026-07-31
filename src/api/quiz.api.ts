import { apiClient } from './api-client';
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
import type {
  CreateQuizPayload,
  QuizDeleteResponse,
  QuizMutationResponse,
  UpdateQuizPayload,
} from '@/types/quiz';

export async function createQuiz(payload: CreateQuizPayload) {
  const response = await apiClient.post<QuizMutationResponse>('/quizzes', payload);
  return response.data;
}

export async function getQuiz(quizId: string) {
  const response = await apiClient.get<QuizMutationResponse>(`/quizzes/${quizId}`);
  return response.data;
}

export async function updateQuiz(quizId: string, payload: UpdateQuizPayload) {
  const response = await apiClient.patch<QuizMutationResponse>(`/quizzes/${quizId}`, payload);
  return response.data;
}

export async function deleteQuiz(quizId: string) {
  const response = await apiClient.delete<QuizDeleteResponse>(`/quizzes/${quizId}`);
  return response.data;
}

export async function createQuizQuestion(quizId: string, payload: CreateQuestionPayload) {
  const response = await apiClient.post<QuestionMutationResponse>(
    `/quizzes/${quizId}/questions`,
    payload,
  );
  return response.data;
}

export async function updateQuizQuestion(questionId: string, payload: UpdateQuestionPayload) {
  const response = await apiClient.patch<QuestionMutationResponse>(
    `/quiz-questions/${questionId}`,
    payload,
  );
  return response.data;
}

export async function deleteQuizQuestion(questionId: string) {
  const response = await apiClient.delete<QuestionDeleteResponse>(
    `/quiz-questions/${questionId}`,
  );
  return response.data;
}

export async function createQuizQuestionOption(
  questionId: string,
  payload: CreateQuestionOptionPayload,
) {
  const response = await apiClient.post<QuestionOptionMutationResponse>(
    `/quiz-questions/${questionId}/options`,
    payload,
  );
  return response.data;
}

export async function updateQuizQuestionOption(
  optionId: string,
  payload: UpdateQuestionOptionPayload,
) {
  const response = await apiClient.patch<QuestionOptionMutationResponse>(
    `/quiz-options/${optionId}`,
    payload,
  );
  return response.data;
}

export async function deleteQuizQuestionOption(optionId: string) {
  const response = await apiClient.delete<QuestionOptionDeleteResponse>(
    `/quiz-options/${optionId}`,
  );
  return response.data;
}

export async function persistQuizQuestions(
  quizId: string,
  questions: Array<{
    title: string;
    type: CreateQuestionPayload['type'];
    explanation?: string;
    points: number;
    order: number;
    options: Array<{ text: string; isCorrect: boolean; order: number }>;
  }>,
) {
  const createdQuestions = [];

  for (const question of questions) {
    const questionResponse = await createQuizQuestion(quizId, {
      title: question.title,
      type: question.type,
      explanation: question.explanation,
      points: question.points,
      order: question.order,
    });

    const createdQuestion = questionResponse.data;

    for (const option of question.options) {
      await createQuizQuestionOption(createdQuestion.id, {
        text: option.text,
        isCorrect: option.isCorrect,
        order: option.order,
      });
    }

    createdQuestions.push(createdQuestion);
  }

  return createdQuestions;
}
