'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourseSkill,
  deleteCourseSkill,
  getCourseSkills,
} from '@/api/course-skill.api';
import type { CourseSkill } from '@/types/course-skill';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { courseQueryKeys } from '@/hooks/use-courses';

export const courseSkillQueryKeys = {
  list: (courseId: string) => ['course-skills', courseId] as const,
};

export function useCourseSkills(
  courseId: string,
  options?: { enabled?: boolean; initialData?: CourseSkill[] },
) {
  const enabled = options?.enabled ?? Boolean(courseId);

  return useQuery({
    queryKey: courseSkillQueryKeys.list(courseId),
    queryFn: () => getCourseSkills(courseId),
    enabled,
    initialData: options?.initialData,
  });
}

export function useCreateCourseSkill(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createCourseSkill(courseId, { name }),
    onSuccess: (response) => {
      toast.success(response.message || 'Skill added successfully.');
      queryClient.invalidateQueries({ queryKey: courseSkillQueryKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add skill.'));
    },
  });
}

export function useDeleteCourseSkill(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => deleteCourseSkill(courseId, skillId),
    onSuccess: (response) => {
      toast.success(response.message || 'Skill removed successfully.');
      queryClient.invalidateQueries({ queryKey: courseSkillQueryKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove skill.'));
    },
  });
}
