'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getExamAttemptResult,
  getMyExamAttempts,
  startExamAttempt,
  submitExamAttempt,
} from '@/api/exam-attempt.api';
import type { ExamSubmitPayload } from '@/types/exam-attempt';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { learningQueryKeys } from '@/hooks/use-learning';
import { progressQueryKeys } from '@/hooks/use-progress';

export const examAttemptQueryKeys = {
  history: (examId: string, courseId?: string) =>
    ['exam-attempts', examId, courseId ?? 'default'] as const,
  result: (examId: string, attemptId: string, courseId?: string) =>
    ['exam-attempt-result', examId, attemptId, courseId ?? 'default'] as const,
};

export function useMyExamAttempts(examId: string, courseId?: string, enabled = true) {
  return useQuery({
    queryKey: examAttemptQueryKeys.history(examId, courseId),
    queryFn: () => getMyExamAttempts(examId, courseId),
    enabled: Boolean(examId) && enabled,
    select: (response) => {
      const attempts = response.data ?? [];
      const maxAttempts = response.exam?.maxAttempts ?? 1;
      const submittedCount = attempts.filter((attempt) => attempt.status !== 'IN_PROGRESS').length;
      const inProgress = attempts.find((attempt) => attempt.status === 'IN_PROGRESS');

      return {
        attempts,
        maxAttempts,
        attemptsRemaining: Math.max(0, maxAttempts - submittedCount),
        inProgressAttemptId: inProgress?.id ?? null,
      };
    },
  });
}

export function useStartExamAttempt(examId: string, courseId?: string, courseSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startExamAttempt(examId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: examAttemptQueryKeys.history(examId, courseId),
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Unable to start exam.');
      if (message.toLowerCase().includes('maximum attempts')) {
        toast.error('Maximum attempts reached');
        return;
      }
      toast.error(message);
    },
  });
}

export function useSubmitExamAttempt(examId: string, courseId?: string, courseSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExamSubmitPayload) => submitExamAttempt(examId, payload, courseId),
    onSuccess: (response) => {
      toast.success(response.message || 'Exam submitted successfully');
      queryClient.invalidateQueries({
        queryKey: examAttemptQueryKeys.history(examId, courseId),
      });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: progressQueryKeys.course(courseId) });
        queryClient.invalidateQueries({ queryKey: progressQueryKeys.resume(courseId) });
      }
      if (courseSlug) {
        queryClient.invalidateQueries({ queryKey: learningQueryKeys.course(courseSlug) });
      }
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Unable to submit exam.');
      toast.error(message);
    },
  });
}

export function useExamAttemptResult(
  examId: string,
  attemptId: string,
  courseId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: examAttemptQueryKeys.result(examId, attemptId, courseId),
    queryFn: () => getExamAttemptResult(examId, attemptId, courseId),
    enabled: Boolean(examId && attemptId) && enabled,
    select: (response) => response.data,
  });
}
