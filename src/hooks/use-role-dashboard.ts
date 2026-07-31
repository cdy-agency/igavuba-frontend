'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/dashboard.api';
import type { DashboardPayload } from '@/types/dashboard.types';

export const dashboardQueryKeys = {
  overview: ['dashboard'] as const,
};

export function useRoleDashboard(enabled = true) {
  return useQuery<DashboardPayload>({
    queryKey: dashboardQueryKeys.overview,
    queryFn: getDashboard,
    enabled,
    staleTime: 60_000,
  });
}
