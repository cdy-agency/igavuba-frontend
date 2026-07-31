'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInstitutionSettings,
  updateInstitutionSettings,
} from '@/api/institution-settings.api';
import type { UpdateInstitutionSettingsPayload } from '@/types/institution-settings.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const institutionSettingsQueryKeys = {
  current: ['institution-settings'] as const,
};

export function useInstitutionSettings(enabled = true) {
  return useQuery({
    queryKey: institutionSettingsQueryKeys.current,
    queryFn: getInstitutionSettings,
    enabled,
    select: (response) => response.data,
  });
}

export function useUpdateInstitutionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInstitutionSettingsPayload) =>
      updateInstitutionSettings(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Settings updated successfully.');
      queryClient.setQueryData(institutionSettingsQueryKeys.current, response);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update settings.'));
    },
  });
}
