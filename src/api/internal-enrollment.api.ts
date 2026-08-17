import { apiClient } from './api-client';
import type {
  BulkInternalEnrollmentPayload,
  CourseStudentRow,
  InternalEnrollmentPayload,
  StudentCourseEnrollment,
  StudentMutationResponse,
} from '@/types/student.types';

export async function enrollStudentsInternal(payload: InternalEnrollmentPayload) {
  const response = await apiClient.post<StudentMutationResponse<unknown>>(
    '/internal-enrollments',
    payload,
  );
  return response.data;
}

export async function bulkEnrollStudentsInternal(payload: BulkInternalEnrollmentPayload) {
  const response = await apiClient.post<
    StudentMutationResponse<{
      courses: { courseId: string; enrolledCount: number }[];
      learnerCount: number;
    }>
  >('/internal-enrollments/bulk', payload);
  return response.data;
}

export async function listCourseStudents(courseId: string): Promise<CourseStudentRow[]> {
  const response = await apiClient.get<StudentMutationResponse<CourseStudentRow[]>>(
    `/courses/${courseId}/students`,
  );
  return response.data.data;
}

export async function listStudentCourses(studentId: string) {
  const response = await apiClient.get<StudentMutationResponse<StudentCourseEnrollment[]>>(
    `/students/${studentId}/courses`,
  );
  return response.data.data;
}
