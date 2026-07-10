'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createExam,
  createExamQuestion,
  createExamQuestionOption,
  deleteExam,
  deleteExamQuestion,
  deleteExamQuestionOption,
  getExam,
  getExamSubmission,
  getExamSubmissions,
  gradeExamAnswer,
  persistExamQuestions,
  publishAllExamResults,
  publishExamResult,
  updateExam,
  updateExamQuestion,
  updateExamQuestionOption,
  type CreateExamPayload,
  type UpdateExamPayload,
} from '@/api/exam.api';
import type {
  CreateQuestionOptionPayload,
  CreateQuestionPayload,
  UpdateQuestionOptionPayload,
  UpdateQuestionPayload,
} from '@/types/question';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { examListQueryKeys } from '@/hooks/use-exam-list';
import { moduleContentQueryKeys } from '@/hooks/use-module-contents';

export const examQueryKeys = {
  detail: (examId: string) => ['exams', examId] as const,
  submissions: (examId: string) => ['exams', examId, 'submissions'] as const,
  submission: (attemptId: string) => ['exams', 'submissions', attemptId] as const,
};

export function useExamDetail(examId: string, enabled = true) {
  return useQuery({
    queryKey: examQueryKeys.detail(examId),
    queryFn: () => getExam(examId),
    enabled: Boolean(examId) && enabled,
    select: (response) => response.data,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExamPayload) => createExam(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Exam created successfully');
      queryClient.invalidateQueries({ queryKey: examListQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create exam.'));
    },
  });
}

export function useUpdateExam(examId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateExamPayload) => updateExam(examId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Exam updated successfully');
      queryClient.invalidateQueries({ queryKey: examQueryKeys.detail(examId) });
      queryClient.invalidateQueries({ queryKey: examListQueryKeys.all });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update exam.'));
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => deleteExam(examId),
    onSuccess: (response) => {
      toast.success(response.message || 'Exam deleted successfully');
      queryClient.invalidateQueries({ queryKey: examListQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete exam.'));
    },
  });
}

export function usePersistExamQuestions() {
  return useMutation({
    mutationFn: ({
      examId,
      questions,
    }: {
      examId: string;
      questions: Parameters<typeof persistExamQuestions>[1];
    }) => persistExamQuestions(examId, questions),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save exam questions.'));
    },
  });
}

export function useCreateExamQuestion(examId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuestionPayload & { instructions?: string }) =>
      createExamQuestion(examId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.detail(examId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add question.'));
    },
  });
}

export function useUpdateExamQuestion(examId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: UpdateQuestionPayload & { instructions?: string };
    }) => updateExamQuestion(questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.detail(examId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update question.'));
    },
  });
}

export function useDeleteExamQuestion(examId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteExamQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.detail(examId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete question.'));
    },
  });
}

export function useCreateExamQuestionOption(examId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: CreateQuestionOptionPayload;
    }) => createExamQuestionOption(questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.detail(examId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add option.'));
    },
  });
}

export function useUpdateExamQuestionOption(examId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      optionId,
      payload,
    }: {
      optionId: string;
      payload: UpdateQuestionOptionPayload;
    }) => updateExamQuestionOption(optionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.detail(examId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update option.'));
    },
  });
}

export function useDeleteExamQuestionOption(examId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionId: string) => deleteExamQuestionOption(optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.detail(examId) });
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete option.'));
    },
  });
}

export function useExamSubmissions(examId: string, enabled = true) {
  return useQuery({
    queryKey: examQueryKeys.submissions(examId),
    queryFn: () => getExamSubmissions(examId),
    enabled: Boolean(examId) && enabled,
    select: (response) => response.data,
  });
}

export function useExamSubmissionDetail(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: examQueryKeys.submission(attemptId),
    queryFn: () => getExamSubmission(attemptId),
    enabled: Boolean(attemptId) && enabled,
    select: (response) => response.data,
  });
}

export function useGradeExamAnswer(examId: string, attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      answerId,
      score,
      feedback,
    }: {
      answerId: string;
      score: number;
      feedback?: string;
    }) => gradeExamAnswer(answerId, { score, feedback }),
    onSuccess: (response) => {
      toast.success(response.message || 'Essay graded successfully');
      queryClient.invalidateQueries({ queryKey: examQueryKeys.submissions(examId) });
      queryClient.invalidateQueries({ queryKey: examQueryKeys.submission(attemptId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to grade essay.'));
    },
  });
}

export function usePublishExamResult(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId: string) => publishExamResult(attemptId),
    onSuccess: (response) => {
      toast.success(response.message || 'Results published successfully');
      queryClient.invalidateQueries({ queryKey: examQueryKeys.submissions(examId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to publish results.'));
    },
  });
}

export function usePublishAllExamResults(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishAllExamResults(examId),
    onSuccess: (response) => {
      toast.success(response.message || 'Results published successfully');
      queryClient.invalidateQueries({ queryKey: examQueryKeys.submissions(examId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to publish results.'));
    },
  });
}
