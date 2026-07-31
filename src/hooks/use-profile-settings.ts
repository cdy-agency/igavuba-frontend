'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import {
  getCurrentInstitutionProfile,
  updateCurrentInstitutionProfile,
} from '@/api/institution.api';
import { currentUserQueryKey } from '@/hooks/use-current-user';
import { getApiErrorMessage, getStoredAuthState, persistAuthState } from '@/lib/auth';
import { toast } from '@/lib/toast';
import type { ChangePasswordDto, UpdateProfileDto } from '@/types';
import type { UpdateInstitutionPayload } from '@/types/admin';

export const profileSettingsQueryKeys = {
  currentInstitution: ['institutions', 'me'] as const,
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileDto) => authApi.updateMe(payload),
    onSuccess: (response) => {
      const stored = getStoredAuthState();
      if (stored) {
        persistAuthState({
          ...stored,
          user: response.user,
        });
      }
      queryClient.setQueryData(currentUserQueryKey, response);
      toast.success(response.message || 'Profile updated successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update profile'));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordDto) => authApi.changePassword(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Password changed successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to change password'));
    },
  });
}

export function useCurrentInstitutionProfile(enabled = true) {
  return useQuery({
    queryKey: profileSettingsQueryKeys.currentInstitution,
    queryFn: getCurrentInstitutionProfile,
    enabled,
  });
}

export function useUpdateCurrentInstitutionProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInstitutionPayload) =>
      updateCurrentInstitutionProfile(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: profileSettingsQueryKeys.currentInstitution,
      });
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
      toast.success(response.message || 'Institution profile updated successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update institution profile'));
    },
  });
}
