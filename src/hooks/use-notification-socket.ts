'use client';

import { useCallback, useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/use-auth';
import { getAccessToken } from '@/lib/auth';
import type { AppNotification } from '@/types/notification.types';
import { notificationQueryKeys } from '@/hooks/use-notifications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getSocketBaseUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

/**
 * Keeps notification queries in sync via authenticated WebSocket push.
 * Falls back to existing React Query polling when disconnected.
 */
export function useNotificationSocket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const handleNewNotification = useCallback(
    (notification: AppNotification) => {
      queryClient.setQueryData(
        notificationQueryKeys.unreadCount,
        (prev: number | undefined) => (typeof prev === 'number' ? prev + (notification.isRead ? 0 : 1) : prev),
      );

      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
    [queryClient],
  );

  const handleUnreadCount = useCallback(
    (payload: { unreadCount: number }) => {
      queryClient.setQueryData(notificationQueryKeys.unreadCount, payload.unreadCount);
    },
    [queryClient],
  );

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${getSocketBaseUrl()}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:unread-count', handleUnreadCount);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:unread-count', handleUnreadCount);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, handleNewNotification, handleUnreadCount]);
}
