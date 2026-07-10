import { apiClient } from './api-client';
import type { AchievementsResponse } from '@/types/achievements.types';

export async function getMyAchievements() {
  const response = await apiClient.get<AchievementsResponse>('/achievements/me');
  return response.data;
}
