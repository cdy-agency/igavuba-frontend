'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteAssignmentSubmission,
  getAssignmentSubmission,
  getMyAssignmentSubmissions,
  listAssignmentSubmissions,
  publishAllAssignmentResults,
  publishAssignmentGrade,
  saveAssignmentGrade,
  submitAssignment,
} from '@/api/assignment.api';
import type {
  AssignmentSubmission,
  AssignmentSubmissionHistory,
  GradeAssignmentSubmissionPayload,
  SubmitAssignmentPayload,
} from '@/types/assignment-submission.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { learningQueryKeys } from '@/hooks/use-learning';
import { progressQueryKeys } from '@/hooks/use-progress';

export const assignmentSubmissionQueryKeys = {
  mine: (assignmentId: string, courseId?: string) =>
    ['assignment-submissions', 'mine', assignmentId, courseId ?? ''] as const,
  list: (assignmentId: string) => ['assignment-submissions', 'list', assignmentId] as const,
  detail: (submissionId: string) =>
    ['assignment-submissions', 'detail', submissionId] as const,
};

export function useMyAssignmentSubmissions(
  assignmentId: string,
  courseId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: assignmentSubmissionQueryKeys.mine(assignmentId, courseId),
    queryFn: () => getMyAssignmentSubmissions(assignmentId, courseId),
    enabled: Boolean(assignmentId) && enabled,
    select: (response) => response.data,
  });
}

export function useAssignmentSubmissions(assignmentId: string, enabled = true) {
  return useQuery({
    queryKey: assignmentSubmissionQueryKeys.list(assignmentId),
    queryFn: () => listAssignmentSubmissions(assignmentId),
    enabled: Boolean(assignmentId) && enabled,
    select: (response) => response.data,
  });
}

export function useAssignmentSubmission(submissionId: string, enabled = true) {
  return useQuery({
    queryKey: assignmentSubmissionQueryKeys.detail(submissionId),
    queryFn: () => getAssignmentSubmission(submissionId),
    enabled: Boolean(submissionId) && enabled,
    select: (response) => response.data,
  });
}

export function useSubmitAssignment(
  assignmentId: string,
  courseId?: string,
  courseSlug?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAssignmentPayload) =>
      submitAssignment(assignmentId, payload, courseId),
    onSuccess: (response) => {
      toast.success(response.message || 'Submission received');

      const submitted = response.data;
      queryClient.setQueryData(
        assignmentSubmissionQueryKeys.mine(assignmentId, courseId),
        (current: { success?: boolean; message?: string; data?: AssignmentSubmissionHistory } | undefined) => {
          if (!current?.data) {
            return current;
          }

          const mappedSubmission: AssignmentSubmission = {
            id: submitted.id,
            attemptNumber: submitted.attemptNumber,
            status: submitted.status,
            textAnswer: submitted.textAnswer,
            fileUrl: submitted.fileUrl,
            linkUrl: submitted.linkUrl,
            submittedAt: submitted.submittedAt,
            createdAt: submitted.createdAt,
            updatedAt: submitted.updatedAt,
            deletable: submitted.deletable,
            grade: submitted.grade,
          };

          return {
            ...current,
            data: {
              ...current.data,
              attemptsUsed: submitted.attemptsUsed,
              attemptsRemaining: submitted.attemptsRemaining,
              contentCompleted:
                submitted.markedComplete || current.data.contentCompleted,
              courseProgress: submitted.courseProgress ?? current.data.courseProgress,
              submissions: [
                mappedSubmission,
                ...current.data.submissions.filter((entry) => entry.id !== mappedSubmission.id),
              ],
            },
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: assignmentSubmissionQueryKeys.mine(assignmentId, courseId),
      });
      if (courseSlug) {
        void queryClient.invalidateQueries({ queryKey: learningQueryKeys.course(courseSlug) });
      }
      if (courseId) {
        void queryClient.invalidateQueries({ queryKey: progressQueryKeys.course(courseId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to submit assignment.'));
    },
  });
}

export function useDeleteAssignmentSubmission(
  assignmentId: string,
  courseId?: string,
  courseSlug?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) =>
      deleteAssignmentSubmission(assignmentId, submissionId, courseId),
    onSuccess: (response) => {
      toast.success(response.message || 'Submission deleted');
      queryClient.invalidateQueries({
        queryKey: assignmentSubmissionQueryKeys.mine(assignmentId, courseId),
      });
      if (courseSlug) {
        queryClient.invalidateQueries({ queryKey: learningQueryKeys.course(courseSlug) });
      }
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: progressQueryKeys.course(courseId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete submission.'));
    },
  });
}

function invalidateAssignmentGradingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  assignmentId: string,
  submissionId?: string,
) {
  queryClient.invalidateQueries({
    queryKey: assignmentSubmissionQueryKeys.list(assignmentId),
  });
  if (submissionId) {
    queryClient.invalidateQueries({
      queryKey: assignmentSubmissionQueryKeys.detail(submissionId),
    });
  }
}

export function useSaveAssignmentGrade(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: GradeAssignmentSubmissionPayload;
    }) => saveAssignmentGrade(submissionId, payload),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Grade saved successfully');
      invalidateAssignmentGradingQueries(
        queryClient,
        assignmentId,
        variables.submissionId,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save grade.'));
    },
  });
}

export function usePublishAssignmentGrade(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) => publishAssignmentGrade(submissionId),
    onSuccess: (response, submissionId) => {
      toast.success(response.message || 'Results published successfully');
      invalidateAssignmentGradingQueries(queryClient, assignmentId, submissionId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to publish results.'));
    },
  });
}

export function usePublishAllAssignmentResults(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishAllAssignmentResults(assignmentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Results published successfully');
      queryClient.invalidateQueries({
        queryKey: assignmentSubmissionQueryKeys.list(assignmentId),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to publish results.'));
    },
  });
}
