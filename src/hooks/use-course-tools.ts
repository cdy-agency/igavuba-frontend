'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourseTool,
  deleteCourseTool,
  getCourseTools,
} from '@/api/course-tool.api';
import type { CourseTool } from '@/types/course-tool';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { courseQueryKeys } from '@/hooks/use-courses';

export const courseToolQueryKeys = {
  list: (courseId: string) => ['course-tools', courseId] as const,
};

export function useCourseTools(
  courseId: string,
  options?: { enabled?: boolean; initialData?: CourseTool[] },
) {
  const enabled = options?.enabled ?? Boolean(courseId);

  return useQuery({
    queryKey: courseToolQueryKeys.list(courseId),
    queryFn: () => getCourseTools(courseId),
    enabled,
    initialData: options?.initialData,
  });
}

export function useCreateCourseTool(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createCourseTool(courseId, { name }),
    onSuccess: (response) => {
      toast.success(response.message || 'Tool added successfully.');
      queryClient.invalidateQueries({ queryKey: courseToolQueryKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add tool.'));
    },
  });
}

export function useDeleteCourseTool(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (toolId: string) => deleteCourseTool(courseId, toolId),
    onSuccess: (response) => {
      toast.success(response.message || 'Tool removed successfully.');
      queryClient.invalidateQueries({ queryKey: courseToolQueryKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove tool.'));
    },
  });
}
