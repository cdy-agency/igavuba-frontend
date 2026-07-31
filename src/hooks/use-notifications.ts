'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  courseId: string | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly?: boolean) => ['notifications', 'list', unreadOnly ?? false] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export async function getNotifications(limit = 20, unreadOnly = false) {
  const response = await apiClient.get<{
    success: boolean;
    data: { data: AppNotification[]; unreadCount: number };
  }>('/notifications', {
    params: { limit, unread: unreadOnly ? 'true' : undefined },
  });
  return response.data.data;
}

export async function getUnreadNotificationCount() {
  const response = await apiClient.get<{
    success: boolean;
    data: { unreadCount: number };
  }>('/notifications/unread-count');
  return response.data.data.unreadCount;
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

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: notificationQueryKeys.list(false),
    queryFn: () => getNotifications(limit),
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
