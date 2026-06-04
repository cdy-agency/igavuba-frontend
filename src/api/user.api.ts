import type { UserListItem } from '@/types/admin';
import type { PaginatedResponse } from '@/types/pagination';
import { apiClient } from './api-client';

export interface UpdateUserActiveResponse {
  success: boolean;
  message: string;
  data: UserListItem;
}

export async function listUsers(params?: Record<string, string | number>) {
  const response = await apiClient.get<PaginatedResponse<UserListItem>>('/users', {
    params,
  });
  return response.data;
}

export async function updateUserActive(id: string, active: boolean) {
  const response = await apiClient.patch<UpdateUserActiveResponse>(
    `/users/${id}/active`,
    { active },
  );
  return response.data;
}
