import { apiClient } from './api-client';
import type {
  AssignLearnersPayload,
  CourseLearnersResponse,
  CreateEnrollmentPayload,
  EnrollmentMutationResponse,
  EnrollmentStatusApiResponse,
  MyEnrollmentsResponse,
} from '@/types/enrollment';

export async function createEnrollment(payload: CreateEnrollmentPayload) {
  const response = await apiClient.post<EnrollmentMutationResponse>(
    '/enrollments',
    payload,
  );
  return response.data;
}

export async function getMyEnrollments() {
  const response = await apiClient.get<MyEnrollmentsResponse>('/enrollments/my');
  return response.data.data;
}

export async function getCourseEnrollmentStatus(courseIdOrSlug: string) {
  const response = await apiClient.get<EnrollmentStatusApiResponse>(
    `/courses/${courseIdOrSlug}/enrollment-status`,
  );
  return response.data.data;
}

export async function assignLearnersToCourse(
  courseIdOrSlug: string,
  payload: AssignLearnersPayload,
) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: EnrollmentMutationResponse['data'][];
  }>(`/courses/${courseIdOrSlug}/assign-learners`, payload);
  return response.data;
}

export async function getCourseLearners(courseIdOrSlug: string) {
  const response = await apiClient.get<CourseLearnersResponse>(
    `/courses/${courseIdOrSlug}/learners`,
  );
  return response.data.data;
}

export async function removeLearnerFromCourse(
  courseIdOrSlug: string,
  learnerId: string,
) {
  const response = await apiClient.delete<EnrollmentMutationResponse>(
    `/courses/${courseIdOrSlug}/learners/${learnerId}`,
  );
  return response.data;
}
