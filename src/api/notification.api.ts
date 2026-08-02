import { apiClient } from './api-client';
import type {
  AppNotification,
  NotificationListParams,
  NotificationListResponse,
} from '@/types/notification.types';

export async function getNotifications(params: NotificationListParams = {}) {
  const response = await apiClient.get<{
    success: boolean;
    data: AppNotification[];
    unreadCount: number;
    pagination: NotificationListResponse['pagination'];
  }>('/notifications', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      unread: params.unread ? 'true' : undefined,
      category: params.category,
    },
  });

  return {
    data: response.data.data,
    unreadCount: response.data.unreadCount,
    pagination: response.data.pagination,
  } satisfies NotificationListResponse;
}

export async function getUnreadNotificationCount() {
  const response = await apiClient.get<{
    success: boolean;
    unreadCount: number;
  }>('/notifications/unread-count');
  return response.data.unreadCount;
}

export async function markNotificationAsRead(id: string) {
  const response = await apiClient.patch<{ success: boolean; message: string }>(
    `/notifications/${id}/read`,
  );
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await apiClient.patch<{ success: boolean; message: string }>(
    '/notifications/read-all',
  );
  return response.data;
}

export async function deleteNotification(id: string) {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/notifications/${id}`,
  );
  return response.data;
}
