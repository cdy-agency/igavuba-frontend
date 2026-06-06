'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourse,
  getCourse,
  getCourses,
  permanentlyDeleteCourse,
  updateCourse,
  updateCourseStatus,
} from '@/api/course.api';
import type { CourseListQueryParams, UpdateCoursePayload } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import type { CourseFormValues } from '@/schema/course.schema';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const courseQueryKeys = {
  all: ['courses'] as const,
  list: (params: CourseListQueryParams) => ['courses', 'list', params] as const,
  detail: (idOrSlug: string) => ['courses', 'detail', idOrSlug] as const,
};

const listQueryOptions = {
  placeholderData: <T,>(previousData: T | undefined) => previousData,
};

export function useCoursesList(params: CourseListQueryParams) {
  return useQuery({
    queryKey: courseQueryKeys.list(params),
    queryFn: () => getCourses(params),
    ...listQueryOptions,
  });
}

export function useCourseDetail(idOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: courseQueryKeys.detail(idOrSlug),
    queryFn: () => getCourse(idOrSlug),
    enabled: Boolean(idOrSlug) && enabled,
    select: (response) => response.data,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CourseFormValues) => createCourse(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Course created successfully.');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create course.'));
    },
  });
}

export function useUpdateCourse(idOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCoursePayload) => updateCourse(idOrSlug, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Course updated successfully.');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(idOrSlug) });
      if (response.data.slug !== idOrSlug) {
        queryClient.invalidateQueries({
          queryKey: courseQueryKeys.detail(response.data.slug),
        });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update course.'));
    },
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      updateCourseStatus(courseId, CourseLifecycleStatus.ARCHIVED),
    onSuccess: (response) => {
      toast.success(response.message || 'Course archived successfully.');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to archive course.'));
    },
  });
}

export function usePermanentlyDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => permanentlyDeleteCourse(courseId),
    onSuccess: (response) => {
      toast.success(response.message || 'Course permanently deleted.');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Course deletion failed.'));
    },
  });
}
