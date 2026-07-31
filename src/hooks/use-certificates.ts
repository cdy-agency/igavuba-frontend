'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCourseCertificate,
  getMyCertificates,
  issueCourseCertificate,
  type IssuedCertificate,
} from '@/api/certificates.api';
import { academicQueryKeys } from '@/hooks/use-academic';

export const certificateQueryKeys = {
  my: (params?: { page?: number; limit?: number }) =>
    ['certificates', 'my', params?.page ?? 1, params?.limit ?? 20] as const,
  course: (courseIdOrSlug: string) => ['certificates', 'course', courseIdOrSlug] as const,
};

export function useMyCertificates(params?: { page?: number; limit?: number }, enabled = true) {
  return useQuery({
    queryKey: certificateQueryKeys.my(params),
    queryFn: async () => {
      const response = await getMyCertificates(params);
      return response.data ?? [];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useCourseCertificate(courseIdOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: certificateQueryKeys.course(courseIdOrSlug),
    queryFn: async () => {
      const response = await getCourseCertificate(courseIdOrSlug);
      return response.data ?? null;
    },
    enabled: Boolean(courseIdOrSlug) && enabled,
    staleTime: 15_000,
  });
}

export function useIssueCourseCertificate(courseIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await issueCourseCertificate(courseIdOrSlug);
      return response.data ?? null;
    },
    onSuccess: (certificate) => {
      if (certificate) {
        queryClient.setQueryData(certificateQueryKeys.course(courseIdOrSlug), certificate);
      }
      queryClient.invalidateQueries({ queryKey: certificateQueryKeys.course(courseIdOrSlug) });
      queryClient.invalidateQueries({ queryKey: certificateQueryKeys.my() });
      queryClient.invalidateQueries({ queryKey: academicQueryKeys.eligibility(courseIdOrSlug) });
    },
  });
}
