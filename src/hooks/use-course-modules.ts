'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createModule,
  deleteModule,
  getCourseModules,
  reorderModules,
  updateModule,
} from '@/api/module.api';
import type {
  CourseModule,
  CreateModulePayload,
  ReorderModulesPayload,
  UpdateModulePayload,
} from '@/types/module';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const moduleQueryKeys = {
  list: (courseId: string) => ['course-modules', courseId] as const,
};

const listQueryOptions = {
  placeholderData: <T,>(previousData: T | undefined) => previousData,
};

export function useCourseModules(courseId: string, enabled = true) {
  return useQuery<CourseModule[]>({
    queryKey: moduleQueryKeys.list(courseId),
    queryFn: () => getCourseModules(courseId),
    enabled: Boolean(courseId) && enabled,
    ...listQueryOptions,
  });
}

export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateModulePayload) => createModule(courseId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Module created successfully.');
      queryClient.invalidateQueries({ queryKey: moduleQueryKeys.list(courseId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create module.'));
    },
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: UpdateModulePayload }) =>
      updateModule(moduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleQueryKeys.list(courseId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update module.'));
    },
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => deleteModule(moduleId),
    onSuccess: (response) => {
      toast.success(response.message || 'Module deleted successfully.');
      queryClient.invalidateQueries({ queryKey: moduleQueryKeys.list(courseId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete module.'));
    },
  });
}

export function useReorderModules(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderModulesPayload) => reorderModules(courseId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Modules reordered successfully.');
      queryClient.invalidateQueries({ queryKey: moduleQueryKeys.list(courseId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to reorder modules.'));
      queryClient.invalidateQueries({ queryKey: moduleQueryKeys.list(courseId) });
    },
  });
}
