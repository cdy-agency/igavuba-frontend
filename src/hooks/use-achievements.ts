'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyAchievements } from '@/api/achievements.api';

export const achievementsQueryKeys = {
  mine: ['achievements', 'me'] as const,
};

export function useMyAchievements(enabled = true) {
  return useQuery({
    queryKey: achievementsQueryKeys.mine,
    queryFn: getMyAchievements,
    enabled,
    select: (response) => response.data,
  });
}
