'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyQuizAttempts,
  getQuizAttemptResult,
  startQuizAttempt,
  submitQuizAttempt,
} from '@/api/quiz-attempt.api';
import type { QuizSubmitPayload } from '@/types/quiz-attempt';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { learningQueryKeys } from '@/hooks/use-learning';
import { progressQueryKeys } from '@/hooks/use-progress';

export const quizAttemptQueryKeys = {
  history: (quizId: string, courseId?: string) =>
    ['quiz-attempts', quizId, courseId ?? 'default'] as const,
  result: (quizId: string, attemptId: string, courseId?: string) =>
    ['quiz-attempt-result', quizId, attemptId, courseId ?? 'default'] as const,
};

export function useMyQuizAttempts(quizId: string, courseId?: string, enabled = true) {
  return useQuery({
    queryKey: quizAttemptQueryKeys.history(quizId, courseId),
    queryFn: () => getMyQuizAttempts(quizId, courseId),
    enabled: Boolean(quizId) && enabled,
    select: (response) => response.data,
  });
}

export function useStartQuizAttempt(quizId: string, courseId?: string, courseSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startQuizAttempt(quizId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quizAttemptQueryKeys.history(quizId, courseId),
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Unable to start quiz.');
      if (message.toLowerCase().includes('maximum attempts')) {
        toast.error('Maximum attempts reached');
        return;
      }
      toast.error(message);
    },
  });
}

export function useSubmitQuizAttempt(quizId: string, courseId?: string, courseSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuizSubmitPayload) => submitQuizAttempt(quizId, payload, courseId),
    onSuccess: (response) => {
      const { data } = response;

      if (data.timeLimitExceeded) {
        toast.error('Time limit exceeded');
      } else if (data.passed) {
        toast.success('Quiz passed');
      }

      queryClient.invalidateQueries({
        queryKey: quizAttemptQueryKeys.history(quizId, courseId),
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
      const message = getApiErrorMessage(error, 'Unable to submit quiz.');
      if (message.toLowerCase().includes('maximum attempts')) {
        toast.error('Maximum attempts reached');
        return;
      }
      if (message.toLowerCase().includes('time limit')) {
        toast.error('Time limit exceeded');
        return;
      }
      toast.error(message);
    },
  });
}

export function useQuizAttemptResult(
  quizId: string,
  attemptId: string,
  courseId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: quizAttemptQueryKeys.result(quizId, attemptId, courseId),
    queryFn: () => getQuizAttemptResult(quizId, attemptId, courseId),
    enabled: Boolean(quizId && attemptId) && enabled,
    select: (response) => response.data,
  });
}
