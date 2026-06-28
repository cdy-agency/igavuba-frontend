import { apiClient } from './api-client';
import type { DashboardPayload, DashboardResponse } from '@/types/dashboard.types';

export async function getDashboard(): Promise<DashboardPayload> {
  const response = await apiClient.get<DashboardResponse>('/dashboard');
  return response.data.data;
}
