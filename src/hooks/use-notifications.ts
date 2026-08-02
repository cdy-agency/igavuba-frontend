'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/api/notification.api';
import { useAuth } from '@/lib/hooks/use-auth';
import type { AppNotification } from '@/types/notification.types';

export type { AppNotification };

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly?: boolean) => ['notifications', 'list', unreadOnly ?? false] as const,
  infinite: ['notifications', 'infinite'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: notificationQueryKeys.list(false),
    queryFn: () => getNotifications({ page: 1, limit }),
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });
}

export function useInfiniteNotifications(limit = 15) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: notificationQueryKeys.infinite,
    queryFn: ({ pageParam }) => getNotifications({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    enabled: Boolean(user),
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

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
