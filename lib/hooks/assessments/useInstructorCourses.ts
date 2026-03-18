'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorCourses } from '@/lib/api/instructor/courses.api';

export function useInstructorCourses() {
  return useQuery({
    queryKey: ['instructor-courses'],
    queryFn: getInstructorCourses,
  });
}
