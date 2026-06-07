'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { getAccessToken } from '@/lib/auth';

export const currentUserQueryKey = ['auth', 'me'] as const;

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => authApi.getMe(),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
