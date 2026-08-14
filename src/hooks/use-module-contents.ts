'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDocumentContent,
  createAssignmentContent,
  createExamContent,
  createQuizContent,
  createTextContent,
  createVideoContent,
  detachContent,
  getModuleContents,
  reorderModuleContents,
  updateDocumentContent,
  updateTextContent,
  updateVideoContent,
} from '@/api/content.api';
import type {
  CreateDocumentContentPayload,
  CreateAssignmentContentPayload,
  CreateExamContentPayload,
  CreateQuizContentPayload,
  CreateTextContentPayload,
  CreateVideoContentPayload,
  ModuleContentItem,
  ReorderModuleContentsPayload,
  UpdateDocumentContentPayload,
  UpdateTextContentPayload,
  UpdateVideoContentPayload,
} from '@/types/content';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const moduleContentQueryKeys = {
  list: (moduleId: string) => ['module-contents', moduleId] as const,
};

const listQueryOptions = {
  placeholderData: <T,>(previousData: T | undefined) => previousData,
};

export function useModuleContents(moduleId: string, enabled = true) {
  return useQuery<ModuleContentItem[]>({
    queryKey: moduleContentQueryKeys.list(moduleId),
    queryFn: () => getModuleContents(moduleId),
    enabled: Boolean(moduleId) && enabled,
    ...listQueryOptions,
  });
}

export function useCreateTextContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTextContentPayload) => createTextContent(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Lesson created successfully.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create lesson.'));
    },
  });
}

export function useCreateVideoContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVideoContentPayload) => createVideoContent(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Lesson created successfully.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create lesson.'));
    },
  });
}

export function useCreateDocumentContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentContentPayload) =>
      createDocumentContent(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Lesson created successfully.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create lesson.'));
    },
  });
}

export function useCreateQuizContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuizContentPayload) => createQuizContent(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Quiz created successfully.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create quiz.'));
    },
  });
}

export function useCreateExamContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExamContentPayload) => createExamContent(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Exam created successfully');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create exam.'));
    },
  });
}

export function useCreateAssignmentContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssignmentContentPayload) =>
      createAssignmentContent(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Assignment created successfully.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create assignment.'));
    },
  });
}

export function useDetachContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => detachContent(moduleId, contentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Lesson removed successfully.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to remove lesson.'));
    },
  });
}

/**
 * Removes a lesson from the module optimistically with an "Undo" toast
 * window before the detach API call actually commits.
 */
export function useDetachContentWithUndo(moduleId: string) {
  const queryClient = useQueryClient();

  return (item: ModuleContentItem) => {
    const queryKey = moduleContentQueryKeys.list(moduleId);

    queryClient.setQueryData<ModuleContentItem[]>(queryKey, (prev: ModuleContentItem[] | undefined) =>
      prev?.filter((existing: ModuleContentItem) => existing.contentId !== item.contentId),
    );

    toast.undoable({
      title: `"${item.content.title}" removed`,
      description: 'This lesson will be detached from the module.',
      onUndo: () => {
        queryClient.setQueryData<ModuleContentItem[]>(queryKey, (prev: ModuleContentItem[] | undefined) => {
          const next = prev ? [...prev, item] : [item];
          return next.sort((a, b) => a.order - b.order);
        });
      },
      onExpire: () => {
        detachContent(moduleId, item.contentId)
          .then(() => {
            queryClient.invalidateQueries({ queryKey });
          })
          .catch((error) => {
            toast.error(getApiErrorMessage(error, 'Unable to remove lesson.'));
            queryClient.invalidateQueries({ queryKey });
          });
      },
    });
  };
}

export function useReorderModuleContents(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderModuleContentsPayload) =>
      reorderModuleContents(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Lesson reordered successfully.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to reorder lessons.'));
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
  });
}

export function useUpdateTextContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      payload,
    }: {
      contentId: string;
      payload: UpdateTextContentPayload;
    }) => updateTextContent(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update lesson.'));
    },
  });
}

export function useUpdateVideoContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      payload,
    }: {
      contentId: string;
      payload: UpdateVideoContentPayload;
    }) => updateVideoContent(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update lesson.'));
    },
  });
}

export function useUpdateDocumentContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      payload,
    }: {
      contentId: string;
      payload: UpdateDocumentContentPayload;
    }) => updateDocumentContent(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update lesson.'));
    },
  });
}
