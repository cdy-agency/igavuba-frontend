'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStundentModulesByCourseId } from '@/lib/api/courses';
import type { CourseModulesResponse } from '@/lib/types/course';

export function useStudentCourseModules(courseId: string | undefined) {
  return useQuery<CourseModulesResponse>({
    queryKey: ['student-course-modules', courseId],
    queryFn: () => fetchStundentModulesByCourseId(courseId!),
    enabled: !!courseId,
    retry: (_, error: unknown) => !(error as { isRestricted?: boolean })?.isRestricted,
  });
}
