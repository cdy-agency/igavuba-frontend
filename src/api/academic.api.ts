import { apiClient } from './api-client';
import { updateCourse } from './course.api';
import type { UpdateCoursePayload } from '@/types/course';
import type {
  AcademicApiResponse,
  CertificateEligibilityResult,
  CourseAcademicPolicy,
  CourseCompletionResult,
  GrantAssessmentAttemptPayload,
  GrantAssessmentAttemptResult,
  UpdateCourseAcademicPolicyPayload,
} from '@/types/academic.types';

export async function getCourseAcademicPolicy(courseIdOrSlug: string) {
  const response = await apiClient.get<AcademicApiResponse<CourseAcademicPolicy>>(
    `/courses/${courseIdOrSlug}/academic-policy`,
  );
  return response.data;
}

export async function updateCourseAcademicPolicy(
  courseIdOrSlug: string,
  payload: UpdateCourseAcademicPolicyPayload,
) {
  return updateCourse(courseIdOrSlug, payload as UpdateCoursePayload);
}

export async function getCourseCertificateEligibility(
  courseIdOrSlug: string,
  learnerProfileId?: string,
) {
  const response = await apiClient.get<AcademicApiResponse<CertificateEligibilityResult>>(
    `/courses/${courseIdOrSlug}/certificate-eligibility`,
    {
      params: learnerProfileId ? { learnerProfileId } : undefined,
    },
  );
  return response.data;
}

export async function getCourseCompletion(courseIdOrSlug: string, learnerProfileId?: string) {
  const response = await apiClient.get<AcademicApiResponse<CourseCompletionResult>>(
    `/courses/${courseIdOrSlug}/completion`,
    {
      params: learnerProfileId ? { learnerProfileId } : undefined,
    },
  );
  return response.data;
}

export async function getLearnerCertificateEligibility(
  learnerProfileId: string,
  courseId?: string,
) {
  const response = await apiClient.get<
    AcademicApiResponse<{
      learnerProfileId: string;
      courses: Array<{ courseId: string; courseTitle: string } & CertificateEligibilityResult>;
    }>
  >(`/learners/${learnerProfileId}/certificate-eligibility`, {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}
export async function grantAssessmentAttempt(
  assessmentId: string,
  payload: GrantAssessmentAttemptPayload,
) {
  const response = await apiClient.post<AcademicApiResponse<GrantAssessmentAttemptResult>>(
    `/assessments/${assessmentId}/grant-attempt`,
    payload,
  );
  return response.data;
}
