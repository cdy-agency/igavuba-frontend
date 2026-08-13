'use client';

import Link from 'next/link';
import type { AppNotification } from '@/types/notification.types';
import { formatRelativeTime, getNotificationHref } from '@/lib/notification-utils';
import { cn } from '@/lib/utils';

const CATEGORY_LABEL: Record<string, string> = {
  AUTHENTICATION: 'Account',
  COURSE: 'Course',
  ASSESSMENT: 'Assessment',
  ASSIGNMENT: 'Assignment',
  EXAM: 'Exam',
  PAYMENT: 'Payment',
  CERTIFICATE: 'Certificate',
  ENROLLMENT: 'Enrollment',
  SYSTEM: 'System',
};

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const href = getNotificationHref(notification.actionUrl);
  const isUnread = !notification.isRead && !notification.readAt;
  const categoryLabel =
    CATEGORY_LABEL[String(notification.category)] ?? String(notification.category);

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
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium leading-snug text-foreground">{notification.title}</p>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {categoryLabel}
          </span>
        </div>
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
