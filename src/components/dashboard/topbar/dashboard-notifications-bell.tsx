'use client';

import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
  type AppNotification,
} from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

function getNotificationHref(actionUrl: string) {
  try {
    return new URL(actionUrl).pathname;
  } catch {
    return actionUrl;
  }
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const content = (
    <div className="space-y-1">
      <p className="text-sm font-medium leading-snug">{notification.title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
      <p className="text-[10px] text-muted-foreground/80">
        {formatRelativeTime(notification.createdAt)}
      </p>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <DropdownMenuItem
        asChild
        className={cn('cursor-pointer items-start p-3', !notification.readAt && 'bg-primary/5')}
        onClick={() => {
          if (!notification.readAt) {
            onRead(notification.id);
          }
        }}
      >
        <Link href={getNotificationHref(notification.actionUrl)}>
          {content}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      className={cn('cursor-pointer items-start p-3', !notification.readAt && 'bg-primary/5')}
      onClick={() => {
        if (!notification.readAt) {
          onRead(notification.id);
        }
      }}
    >
      {content}
    </DropdownMenuItem>
  );
}

export function DashboardNotificationsBell() {
  const { data, isPending } = useNotifications(15);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.data ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-[1.125rem] w-[1.125rem]" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
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
        <DropdownMenuSeparator className="m-0" />
        {isPending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="max-h-[24rem] overflow-y-auto">
            {notifications.map((notification: AppNotification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => markAsRead.mutate(id)}
              />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
