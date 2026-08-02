'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { UnreadBadge } from '@/components/notifications/UnreadBadge';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';
import { useNotificationSocket } from '@/hooks/use-notification-socket';
import { cn } from '@/lib/utils';

export function NotificationBell({
  className,
  triggerClassName,
}: {
  className?: string;
  triggerClassName?: string;
}) {
  useNotificationSocket();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
            triggerClassName,
          )}
          aria-label="Notifications"
        >
          <Bell className={cn('h-[1.125rem] w-[1.125rem]', className)} />
          <UnreadBadge count={unreadCount} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <NotificationPanel />
      </PopoverContent>
    </Popover>
  );
}
