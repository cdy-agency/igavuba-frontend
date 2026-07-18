'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkEnrollStudentsInternal,
  enrollStudentsInternal,
  listCourseStudents,
  listStudentCourses,
} from '@/api/internal-enrollment.api';
import type {
  BulkInternalEnrollmentPayload,
  CourseStudentRow,
  InternalEnrollmentPayload,
} from '@/types/student.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const internalEnrollmentQueryKeys = {
  courseStudents: (courseId: string) => ['course-students', courseId] as const,
  studentCourses: (studentId: string) => ['student-courses', studentId] as const,
};

export function useCourseStudents(courseId: string, enabled = true) {
  return useQuery<CourseStudentRow[]>({
    queryKey: internalEnrollmentQueryKeys.courseStudents(courseId),
    queryFn: () => listCourseStudents(courseId),
    enabled: Boolean(courseId) && enabled,
  });
}

export function useStudentCourses(studentId: string, enabled = true) {
  return useQuery({
    queryKey: internalEnrollmentQueryKeys.studentCourses(studentId),
    queryFn: () => listStudentCourses(studentId),
    enabled: Boolean(studentId) && enabled,
  });
}

export function useInternalEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InternalEnrollmentPayload) => enrollStudentsInternal(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Student enrolled successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['course-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to enroll student.')),
  });
}

export function useBulkInternalEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkInternalEnrollmentPayload) => bulkEnrollStudentsInternal(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Bulk enrollment completed successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['course-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to complete bulk enrollment.')),
  });
}
