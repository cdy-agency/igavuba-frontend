'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteAssignmentSubmission,
  getMyAssignmentSubmissions,
  listAssignmentSubmissions,
  publishAssignmentGrade,
  saveAssignmentGrade,
  submitAssignment,
} from '@/api/assignment.api';
import type {
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

export function useSaveAssignmentGrade(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: GradeAssignmentSubmissionPayload;
    }) => saveAssignmentGrade(assignmentId, submissionId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Assignment graded successfully');
      queryClient.invalidateQueries({
        queryKey: assignmentSubmissionQueryKeys.list(assignmentId),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save grade.'));
    },
  });
}

export function usePublishAssignmentGrade(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) =>
      publishAssignmentGrade(assignmentId, submissionId),
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
