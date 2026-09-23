'use client';

import { cn } from '@/lib/utils';
import { isCalendarItemPast } from '@/lib/calendar-item-utils';
import type { CalendarItem } from '@/types/event.types';

interface CalendarEventPillProps {
  item: CalendarItem;
  onClick?: (item: CalendarItem) => void;
  className?: string;
}

export function CalendarEventPill({ item, onClick, className }: CalendarEventPillProps) {
  const expired = isCalendarItemPast(item);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(item);
      }}
      className={cn(
        'calendar-event-pill w-full',
        expired && 'calendar-event-pill--expired',
        className,
      )}
      title={expired ? `${item.title} (Expired)` : item.title}
    >
      {expired ? <span className="mr-1 font-semibold">Expired ·</span> : null}
      {item.title}
    </button>
  );
}
