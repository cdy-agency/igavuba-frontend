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
import type { Course, CourseListQueryParams, UpdateCoursePayload } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import type { CourseFormValues } from '@/schema/course.schema';
import type { PaginatedResponse } from '@/types/pagination';
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

export function useCoursesList(params: CourseListQueryParams, enabled = true) {
  return useQuery<PaginatedResponse<Course>>({
    queryKey: courseQueryKeys.list(params),
    queryFn: () => getCourses(params),
    enabled,
    ...listQueryOptions,
  });
}

export function useAssignCoursesToDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { departmentId: string; courseIds: string[] }) => {
      const results = await Promise.all(
        payload.courseIds.map((courseId) =>
          updateCourse(courseId, { departmentId: payload.departmentId }),
        ),
      );
      return results;
    },
    onSuccess: () => {
      toast.success('Courses assigned to department successfully.');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all, exact: false });
      queryClient.invalidateQueries({ queryKey: ['departments'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['lecturers', 'departments'], exact: false });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to assign courses to department.'));
    },
  });
}

export function useUpdateCourseDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { courseId: string; departmentId: string | null }) =>
      updateCourse(payload.courseId, { departmentId: payload.departmentId }),
    onSuccess: () => {
      toast.success('Course department updated successfully.');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all, exact: false });
      queryClient.invalidateQueries({ queryKey: ['departments'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['lecturers', 'departments'], exact: false });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update course department.'));
    },
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

export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      updateCourseStatus(courseId, CourseLifecycleStatus.PUBLISHED),
    onSuccess: (response) => {
      toast.success(response.message || 'Course published successfully.');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to publish course.'));
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
