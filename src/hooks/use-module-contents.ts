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
  getStagedRevisionContents,
  permanentlyDeleteStagedContent,
  reattachStagedContent,
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
  ReattachStagedContentPayload,
  ReorderModuleContentsPayload,
  StagedContentItem,
  UpdateDocumentContentPayload,
  UpdateTextContentPayload,
  UpdateVideoContentPayload,
} from '@/types/content';
import { courseQueryKeys } from '@/hooks/use-courses';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

function invalidateModuleContentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  moduleId: string,
) {
  queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
  queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
}

export const moduleContentQueryKeys = {
  list: (moduleId: string) => ['module-contents', moduleId] as const,
  staged: (courseId: string) => ['staged-contents', courseId] as const,
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
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create assignment.'));
    },
  });
}

export function useDetachContent(moduleId: string, courseId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => detachContent(moduleId, contentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Lesson moved to draft.');
      invalidateModuleContentQueries(queryClient, moduleId);
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.staged(courseId) });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to remove lesson.'));
    },
  });
}

export function useReorderModuleContents(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderModuleContentsPayload) =>
      reorderModuleContents(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Lesson reordered successfully.');
      invalidateModuleContentQueries(queryClient, moduleId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to reorder lessons.'));
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
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
      invalidateModuleContentQueries(queryClient, moduleId);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update lesson.'));
    },
  });
}

export function useStagedRevisionContents(courseId: string, enabled = true) {
  return useQuery<StagedContentItem[]>({
    queryKey: moduleContentQueryKeys.staged(courseId),
    queryFn: async () => {
      const response = await getStagedRevisionContents(courseId);
      return response.data;
    },
    enabled: Boolean(courseId) && enabled,
  });
}

export function useReattachStagedContent(moduleId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReattachStagedContentPayload) =>
      reattachStagedContent(moduleId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Content re-attached successfully.');
      invalidateModuleContentQueries(queryClient, moduleId);
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.staged(courseId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to re-attach content.'));
    },
  });
}

export function usePermanentlyDeleteStagedContent(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      contentId,
    }: {
      moduleId: string;
      contentId: string;
    }) => permanentlyDeleteStagedContent(moduleId, contentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Content permanently deleted.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.staged(courseId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete content.'));
    },
  });
}
