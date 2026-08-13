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
  reorderQuizQuestions,
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
import type { ModuleContentItem } from '@/types/content';
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
    retry: 1,
    refetchOnWindowFocus: false,
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

export function useUpdateQuiz(
  quizId: string,
  options?: { silent?: boolean; moduleId?: string },
) {
  const queryClient = useQueryClient();
  const silent = options?.silent === true;
  const moduleId = options?.moduleId;

  return useMutation({
    mutationFn: (payload: UpdateQuizPayload) => updateQuiz(quizId, payload),
    onSuccess: (response) => {
      if (!silent) {
        toast.success(response.message || 'Quiz updated successfully');
      }
      // Avoid refetch loops in the builder: silent autosave patches the cache
      // instead of invalidating (invalidation re-hydrates form state and re-saves).
      queryClient.setQueryData(quizQueryKeys.detail(quizId), response);
      if (!silent) {
        void queryClient.invalidateQueries({ queryKey: quizListQueryKeys.all });
      }
      // Patch sidebar cache in-place. Do not await invalidateQueries here —
      // mutateAsync waits for onSuccess, so a refetch would leave the builder
      // header stuck on "Saving...".
      if (moduleId) {
        const quiz = response.data;
        queryClient.setQueryData(
          moduleContentQueryKeys.list(moduleId),
          (current: ModuleContentItem[] | undefined) => {
            if (!current || !quiz) return current;
            return current.map((item) => {
              const matchesQuiz =
                item.content.assessment?.quiz?.id === quizId ||
                item.contentId === quiz.assessment.contentId;
              if (!matchesQuiz) return item;
              return {
                ...item,
                content: {
                  ...item.content,
                  title: quiz.assessment.title,
                  description: quiz.assessment.description,
                  isPublished: quiz.assessment.content.isPublished,
                },
              };
            });
          },
        );
      }
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

export function useReorderQuizQuestions(quizId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionIds: string[]) => reorderQuizQuestions(quizId, questionIds),
    onSuccess: (response) => {
      queryClient.setQueryData(quizQueryKeys.detail(quizId), response);
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to reorder questions.'));
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.detail(quizId) });
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
