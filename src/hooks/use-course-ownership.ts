'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignCourseOwner,
  getEligibleCourseOwners,
  transferCourseOwnership,
} from '@/api/course.api';
import { courseQueryKeys } from '@/hooks/use-courses';
import type { AssignCourseOwnerPayload, EligibleCourseOwner } from '@/types/course';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export function useEligibleCourseOwners(courseIdOrSlug: string, enabled = true) {
  return useQuery<EligibleCourseOwner[]>({
    queryKey: ['courses', 'eligible-owners', courseIdOrSlug],
    queryFn: () => getEligibleCourseOwners(courseIdOrSlug),
    enabled: Boolean(courseIdOrSlug) && enabled,
  });
}

export function useAssignCourseOwner(courseIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignCourseOwnerPayload) =>
      assignCourseOwner(courseIdOrSlug, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Course owner assigned successfully');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseIdOrSlug) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to assign course owner.'));
    },
  });
}

export function useTransferCourseOwnership(courseIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignCourseOwnerPayload) =>
      transferCourseOwnership(courseIdOrSlug, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Ownership transferred successfully');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseIdOrSlug) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to transfer ownership.'));
    },
  });
}
