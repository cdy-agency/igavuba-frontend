import { apiClient } from './api-client';
import type {
  CourseLearnerResultDetail,
  CourseResultsData,
  CourseResultsMutationResponse,
  CourseResultsQueryParams,
} from '@/types/course-results.types';

export async function getCourseResults(
  courseIdOrSlug: string,
  params?: CourseResultsQueryParams,
) {
  const response = await apiClient.get<CourseResultsMutationResponse<CourseResultsData>>(
    `/courses/${courseIdOrSlug}/results`,
    { params },
  );
  return response.data;
}

export async function getCourseLearnerResult(
  courseIdOrSlug: string,
  learnerId: string,
) {
  const response = await apiClient.get<
    CourseResultsMutationResponse<CourseLearnerResultDetail>
  >(`/courses/${courseIdOrSlug}/results/${learnerId}`);
  return response.data;
}
