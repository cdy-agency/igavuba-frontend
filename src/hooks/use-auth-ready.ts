'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { getAccessToken } from '@/lib/auth';

/** True when auth bootstrap finished and an access token exists in storage. */
export function useAuthReady() {
  const { isLoading, isAuthenticated } = useAuth();
  return !isLoading && isAuthenticated && Boolean(getAccessToken());
}
