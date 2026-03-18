'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface CourseModule {
  _id: string;
  title: string;
  order_index?: number;
  [key: string]: unknown;
}

async function getCourseModules(courseId: string): Promise<CourseModule[]> {
  const res = await axiosInstance.get<{ modules?: CourseModule[] } | CourseModule[]>(
    `/api/courses/${courseId}/modules`
  );
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (data?.modules && Array.isArray(data.modules)) return data.modules;
  return [];
}

export function useCourseModules(courseId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => getCourseModules(courseId!),
    enabled: !!courseId && enabled,
  });
}
