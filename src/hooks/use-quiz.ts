'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createQuiz,
  createQuizQuestion,
  createQuizQuestionOption,
  deleteQuiz,
  deleteQuizQuestion,
  deleteQuizQuestionOption,
  getQuiz,
  persistQuizQuestions,
  updateQuiz,
  updateQuizQuestion,
  updateQuizQuestionOption,
} from '@/api/quiz.api';
import type {
  CreateQuestionOptionPayload,
  CreateQuestionPayload,
  UpdateQuestionOptionPayload,
  UpdateQuestionPayload,
} from '@/types/question';
import type { CreateQuizPayload, UpdateQuizPayload } from '@/types/quiz';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { moduleContentQueryKeys } from '@/hooks/use-module-contents';
import { quizListQueryKeys } from '@/hooks/use-quiz-list';

export const quizQueryKeys = {
  all: ['quizzes'] as const,
  detail: (quizId: string) => ['quizzes', 'detail', quizId] as const,
};

export function useQuizDetail(quizId: string, enabled = true) {
  return useQuery({
    queryKey: quizQueryKeys.detail(quizId),
    queryFn: () => getQuiz(quizId),
    enabled: Boolean(quizId) && enabled,
    select: (response) => response.data,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuizPayload) => createQuiz(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Quiz created successfully');
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: quizListQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create quiz.'));
    },
  });
}

export function useUpdateQuiz(quizId: string, options?: { silent?: boolean }) {
  const queryClient = useQueryClient();
  const silent = options?.silent === true;

  return useMutation({
    mutationFn: (payload: UpdateQuizPayload) => updateQuiz(quizId, payload),
    onSuccess: (response) => {
      if (!silent) {
        toast.success(response.message || 'Quiz updated successfully');
      }
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: quizListQueryKeys.all });
    },
    onError: (error) => {
      if (!silent) {
        toast.error(getApiErrorMessage(error, 'Unable to update quiz.'));
      }
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => deleteQuiz(quizId),
    onSuccess: (response) => {
      toast.success(response.message || 'Quiz deleted successfully');
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: quizListQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete quiz.'));
    },
  });
}

export function useCreateQuizQuestion(quizId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) => createQuizQuestion(quizId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Question added successfully');
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add question.'));
    },
  });
}

export function useUpdateQuizQuestion(quizId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: UpdateQuestionPayload;
    }) => updateQuizQuestion(questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update question.'));
    },
  });
}

export function useDeleteQuizQuestion(quizId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteQuizQuestion(questionId),
    onSuccess: (response) => {
      toast.success(response.message || 'Question deleted successfully');
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete question.'));
    },
  });
}

export function useCreateQuizQuestionOption(quizId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: CreateQuestionOptionPayload;
    }) => createQuizQuestionOption(questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add option.'));
    },
  });
}

export function useUpdateQuizQuestionOption(quizId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      optionId,
      payload,
    }: {
      optionId: string;
      payload: UpdateQuestionOptionPayload;
    }) => updateQuizQuestionOption(optionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update option.'));
    },
  });
}

export function useDeleteQuizQuestionOption(quizId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionId: string) => deleteQuizQuestionOption(optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete option.'));
    },
  });
}

export function usePersistQuizQuestions() {
  return useMutation({
    mutationFn: ({
      quizId,
      questions,
    }: {
      quizId: string;
      questions: Parameters<typeof persistQuizQuestions>[1];
    }) => persistQuizQuestions(quizId, questions),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save quiz questions.'));
    },
  });
}
