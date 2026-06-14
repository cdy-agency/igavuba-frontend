'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignLearnersToCourse,
  createEnrollment,
  getCourseEnrollmentStatus,
  getCourseLearners,
  getMyEnrollments,
  removeLearnerFromCourse,
} from '@/api/enrollment.api';
import type {
  AssignLearnersPayload,
  CreateEnrollmentPayload,
  MyEnrollmentItem,
} from '@/types/enrollment';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const enrollmentQueryKeys = {
  my: ['enrollments', 'my'] as const,
  status: (courseIdOrSlug: string) =>
    ['enrollments', 'status', courseIdOrSlug] as const,
  courseLearners: (courseIdOrSlug: string) =>
    ['enrollments', 'course-learners', courseIdOrSlug] as const,
};

export function useMyEnrollments(enabled = true) {
  return useQuery<MyEnrollmentItem[]>({
    queryKey: enrollmentQueryKeys.my,
    queryFn: getMyEnrollments,
    enabled,
  });
}

export function useCourseEnrollmentStatus(courseIdOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.status(courseIdOrSlug),
    queryFn: () => getCourseEnrollmentStatus(courseIdOrSlug),
    enabled: Boolean(courseIdOrSlug) && enabled,
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEnrollmentPayload) => createEnrollment(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Enrolled successfully.');
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.my });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'status'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to enroll in this course.'));
    },
  });
}

export function useCourseLearners(courseIdOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.courseLearners(courseIdOrSlug),
    queryFn: () => getCourseLearners(courseIdOrSlug),
    enabled: Boolean(courseIdOrSlug) && enabled,
  });
}

export function useAssignLearners(courseIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignLearnersPayload) =>
      assignLearnersToCourse(courseIdOrSlug, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Learners assigned successfully.');
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.courseLearners(courseIdOrSlug),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to assign learners.'));
    },
  });
}

export function useRemoveLearnerFromCourse(courseIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (learnerId: string) =>
      removeLearnerFromCourse(courseIdOrSlug, learnerId),
    onSuccess: (response) => {
      toast.success(response.message || 'Learner removed from course.');
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.courseLearners(courseIdOrSlug),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to remove learner.'));
    },
  });
}
