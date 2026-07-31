'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  updateAssignment,
} from '@/api/assignment.api';
import type {
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/types/assignment.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { moduleContentQueryKeys } from '@/hooks/use-module-contents';
import { assignmentListQueryKeys } from '@/hooks/use-assignment-list';

export const assignmentQueryKeys = {
  all: ['assignments'] as const,
  detail: (assignmentId: string) => ['assignments', 'detail', assignmentId] as const,
};

export function useAssignmentDetail(assignmentId: string, enabled = true) {
  return useQuery({
    queryKey: assignmentQueryKeys.detail(assignmentId),
    queryFn: () => getAssignment(assignmentId),
    enabled: Boolean(assignmentId) && enabled,
    select: (response) => response.data,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Assignment created successfully');
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: assignmentListQueryKeys.list() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create assignment.'));
    },
  });
}

export function useUpdateAssignment(assignmentId: string, moduleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAssignmentPayload) =>
      updateAssignment(assignmentId, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(assignmentQueryKeys.detail(assignmentId), response.data);
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update assignment.'));
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => deleteAssignment(assignmentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Assignment deleted successfully');
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: assignmentListQueryKeys.list() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete assignment.'));
    },
  });
}
