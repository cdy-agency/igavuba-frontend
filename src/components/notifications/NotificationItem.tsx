'use client';

import Link from 'next/link';
import type { AppNotification } from '@/types/notification.types';
import { formatRelativeTime, getNotificationHref } from '@/lib/notification-utils';
import { cn } from '@/lib/utils';

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const href = getNotificationHref(notification.actionUrl);
  const isUnread = !notification.isRead && !notification.readAt;

  const content = (
    <div className="flex gap-3">
      <span
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
          isUnread ? 'bg-primary' : 'bg-transparent',
        )}
        aria-hidden
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium leading-snug text-foreground">{notification.title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/80">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  const className = cn(
    'block w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-muted/60',
    isUnread && 'bg-primary/5',
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        onClick={() => {
          if (isUnread) onRead(notification.id);
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (isUnread) onRead(notification.id);
      }}
    >
      {content}
    </button>
  );
}
