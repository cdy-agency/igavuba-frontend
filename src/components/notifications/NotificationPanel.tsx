'use client';

import { useEffect, useRef } from 'react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import {
  useInfiniteNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from '@/hooks/use-notifications';

export function NotificationPanel() {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteNotifications(15);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '80px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex w-[min(22rem,calc(100vw-2rem))] flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <p className="text-sm font-semibold">Notifications</p>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            disabled={markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutate()}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        ) : null}
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-3 py-10 text-center text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <ScrollArea className="h-[24rem]">
          <div className="py-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => markAsRead.mutate(id)}
              />
            ))}
            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage ? (
              <div className="flex justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : null}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
