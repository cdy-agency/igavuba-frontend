'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCourseAcademicPolicy,
  getCourseCertificateEligibility,
  getCourseCompletion,
  grantAssessmentAttempt,
  updateCourseAcademicPolicy,
} from '@/api/academic.api';
import { courseQueryKeys } from '@/hooks/use-courses';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import type {
  GrantAssessmentAttemptPayload,
  UpdateCourseAcademicPolicyPayload,
} from '@/types/academic.types';

export const academicQueryKeys = {
  policy: (courseIdOrSlug: string) => ['academic', 'policy', courseIdOrSlug] as const,
  eligibility: (courseIdOrSlug: string, learnerProfileId?: string) =>
    ['academic', 'eligibility', courseIdOrSlug, learnerProfileId ?? 'self'] as const,
  completion: (courseIdOrSlug: string, learnerProfileId?: string) =>
    ['academic', 'completion', courseIdOrSlug, learnerProfileId ?? 'self'] as const,
};

export function useCourseAcademicPolicy(courseIdOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: academicQueryKeys.policy(courseIdOrSlug),
    queryFn: async () => {
      const response = await getCourseAcademicPolicy(courseIdOrSlug);
      return response.data;
    },
    enabled: Boolean(courseIdOrSlug) && enabled,
    staleTime: 30_000,
  });
}

export function useUpdateCourseAcademicPolicy(courseIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCourseAcademicPolicyPayload) =>
      updateCourseAcademicPolicy(courseIdOrSlug, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: academicQueryKeys.policy(courseIdOrSlug) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseIdOrSlug) });
      toast.success(response.message || 'Academic policy updated successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update academic policy.'));
    },
  });
}

export function useCourseCertificateEligibility(
  courseIdOrSlug: string,
  learnerProfileId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: academicQueryKeys.eligibility(courseIdOrSlug, learnerProfileId),
    queryFn: async () => {
      const response = await getCourseCertificateEligibility(courseIdOrSlug, learnerProfileId);
      return response.data;
    },
    enabled: Boolean(courseIdOrSlug) && enabled,
    staleTime: 15_000,
  });
}

export function useCourseCompletion(
  courseIdOrSlug: string,
  learnerProfileId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: academicQueryKeys.completion(courseIdOrSlug, learnerProfileId),
    queryFn: async () => {
      const response = await getCourseCompletion(courseIdOrSlug, learnerProfileId);
      return response.data;
    },
    enabled: Boolean(courseIdOrSlug) && enabled,
    staleTime: 15_000,
  });
}

export function useGrantAssessmentAttempt(assessmentId: string, courseIdOrSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GrantAssessmentAttemptPayload) =>
      grantAssessmentAttempt(assessmentId, payload),
    onSuccess: (response) => {
      if (courseIdOrSlug) {
        queryClient.invalidateQueries({
          queryKey: academicQueryKeys.eligibility(courseIdOrSlug),
        });
      }
      toast.success(response.message || 'Additional attempt granted successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to grant additional attempt.'));
    },
  });
}
