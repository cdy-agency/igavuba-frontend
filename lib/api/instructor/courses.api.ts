import axiosInstance from '@/lib/axios';

export interface InstructorCourse {
  _id: string;
  title: string;
  [key: string]: unknown;
}

export async function getInstructorCourses(): Promise<InstructorCourse[]> {
  const res = await axiosInstance.get<{ courses?: InstructorCourse[] } | InstructorCourse[]>(
    '/api/instructor/courses'
  );
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (data?.courses && Array.isArray(data.courses)) return data.courses;
  return [];
}
