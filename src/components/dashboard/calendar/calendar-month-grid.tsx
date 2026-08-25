'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalendarItem } from '@/types/event.types';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE_EVENTS = 2;

interface CalendarMonthGridProps {
  currentMonth: Date;
  selectedDay: Date;
  itemsByDay: Map<string, CalendarItem[]>;
  isLoading: boolean;
  onMonthChange: (month: Date) => void;
  onSelectDay: (day: Date) => void;
  onItemClick: (item: CalendarItem) => void;
}

export function CalendarMonthGrid({
  currentMonth,
  selectedDay,
  itemsByDay,
  isLoading,
  onMonthChange,
  onSelectDay,
  onItemClick,
}: CalendarMonthGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 shrink-0 border-b border-border/60 bg-card">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {format(currentMonth, 'MMMM d, yyyy')}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-primary hover:bg-primary-subtle"
              onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-primary hover:bg-primary-subtle"
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-border/60 bg-primary-subtle/40">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-7 auto-rows-fr">
          {gridDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayItems = itemsByDay.get(key) ?? [];
            const inCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDay);
            const isTodayDate = isToday(day);
            const hiddenCount = Math.max(0, dayItems.length - MAX_VISIBLE_EVENTS);

            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => onSelectDay(day)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectDay(day);
                  }
                }}
                className={cn(
                  'calendar-day-cell group min-h-[7.5rem] cursor-pointer border-b border-r border-border/50 p-2 text-left transition-colors hover:bg-primary-subtle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isSelected && 'calendar-day-cell--selected bg-primary-subtle/20',
                  !inCurrentMonth && 'bg-muted/20',
                )}
              >
                <div
                  className={cn(
                    'mb-2 flex justify-end',
                    isSelected && 'border-b-2 border-primary pb-1',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1 text-xs font-semibold tabular-nums',
                      isSelected && 'bg-primary text-primary-foreground',
                      isTodayDate && !isSelected && 'bg-primary-subtle text-primary ring-1 ring-primary-muted',
                      inCurrentMonth && !isSelected && !isTodayDate && 'text-foreground',
                      !inCurrentMonth && 'text-muted-foreground/50',
                    )}
                  >
                    {format(day, 'dd')}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayItems.slice(0, MAX_VISIBLE_EVENTS).map((item) => (
                    <button
                      key={`${item.source}-${item.id}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onItemClick(item);
                      }}
                      className="calendar-event-pill w-full"
                      title={item.title}
                    >
                      {item.title}
                    </button>
                  ))}
                  {hiddenCount > 0 ? (
                    <span className="block px-1 text-[11px] font-medium text-primary hover:underline">
                      {hiddenCount} more
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
