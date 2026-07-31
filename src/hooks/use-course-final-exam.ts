'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCourseFinalExam,
  removeCourseFinalExam,
  setCourseFinalExam,
} from '@/api/course-final-exam.api';

export const courseFinalExamQueryKeys = {
  detail: (courseId: string) => ['course-final-exam', courseId] as const,
};

export function useCourseFinalExam(courseId: string, enabled = true) {
  return useQuery({
    queryKey: courseFinalExamQueryKeys.detail(courseId),
    queryFn: () => getCourseFinalExam(courseId),
    enabled: enabled && Boolean(courseId),
    select: (response) => response.data,
  });
}

export function useSetCourseFinalExam(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => setCourseFinalExam(courseId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseFinalExamQueryKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: ['exam-list'] });
    },
  });
}

export function useRemoveCourseFinalExam(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeCourseFinalExam(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseFinalExamQueryKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: ['exam-list'] });
    },
  });
}
