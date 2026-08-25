'use client';

import { format } from 'date-fns';
import { CalendarPlus, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CalendarItem } from '@/types/event.types';
import type { CalendarItemSource } from '@/types/event.types';

const FILTER_OPTIONS: { value: string; label: string; source?: CalendarItemSource }[] = [
  { value: 'all', label: 'All items' },
  { value: 'event', label: 'Events', source: 'EVENT' },
  { value: 'assignment', label: 'Assignments', source: 'ASSIGNMENT' },
  { value: 'exam', label: 'Exams', source: 'EXAM' },
  { value: 'quiz,unlock', label: 'Unlocks & quizzes' },
];

function sourceDotClass(source?: CalendarItemSource) {
  if (source === 'EVENT') return 'bg-primary';
  if (source === 'ASSIGNMENT') return 'bg-accent';
  if (source === 'EXAM') return 'bg-destructive';
  return 'bg-primary-light';
}

interface CalendarSidebarProps {
  currentMonth: Date;
  selectedDay: Date;
  sourceFilter: string;
  canCreate: boolean;
  selectedDayItems: CalendarItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onSourceFilterChange: (value: string) => void;
  onSelectDay: (day: Date) => void;
  onMonthChange: (month: Date) => void;
  onTodayClick: () => void;
  onItemClick: (item: CalendarItem) => void;
}

export function CalendarSidebar({
  currentMonth,
  selectedDay,
  sourceFilter,
  canCreate,
  selectedDayItems,
  searchQuery,
  onSearchChange,
  onCreateClick,
  onSourceFilterChange,
  onSelectDay,
  onMonthChange,
  onTodayClick,
  onItemClick,
}: CalendarSidebarProps) {
  const filteredAgenda = selectedDayItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <aside className="calendar-sidebar flex w-full flex-col border-b border-border/60 lg:w-[17.5rem] lg:border-b-0 lg:border-r">
      <div className="space-y-5 p-5">
        {canCreate ? (
          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover"
            onClick={onCreateClick}
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create event
          </Button>
        ) : null}

        <Calendar
          mode="single"
          selected={selectedDay}
          month={currentMonth}
          onMonthChange={onMonthChange}
          onSelect={(day) => day && onSelectDay(day)}
          className="calendar-mini-picker mx-auto p-0"
          classNames={{
            months: 'w-full',
            month: 'w-full space-y-3',
            caption: 'relative flex items-center justify-center pb-1',
            caption_label: 'text-sm font-semibold text-foreground',
            nav_button: cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-lg border-0 bg-primary-subtle text-primary hover:bg-primary-muted',
            ),
            nav_button_previous: 'absolute left-0',
            nav_button_next: 'absolute right-0',
            head_row: 'flex w-full',
            head_cell: 'flex-1 text-center text-[11px] font-medium uppercase text-muted-foreground',
            row: 'mt-1 flex w-full',
            cell: 'flex-1 p-0 text-center',
            day: cn(
              'mx-auto flex h-8 w-8 items-center justify-center rounded-lg p-0 text-xs font-medium text-foreground hover:bg-primary-subtle',
            ),
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            day_today: 'bg-primary-subtle font-semibold text-primary',
            day_outside: 'text-muted-foreground/50',
          }}
        />

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Filters</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search calendar items"
              className="h-10 rounded-xl border-border/80 bg-muted/40 pl-9 text-sm"
            />
          </div>
          <ul className="space-y-1">
            {FILTER_OPTIONS.map((option) => {
              const active = sourceFilter === option.value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => onSourceFilterChange(option.value)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'bg-primary-subtle ring-1 ring-primary-muted'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2.5 w-2.5 shrink-0 rounded-full',
                        sourceDotClass(option.source),
                      )}
                    />
                    <span
                      className={cn(
                        'truncate text-sm',
                        active ? 'font-semibold text-primary' : 'text-foreground-muted',
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 p-5">
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {format(selectedDay, 'EEEE, MMM d')}
          </p>
          {filteredAgenda.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items on this day.</p>
          ) : (
            <ul className="space-y-2">
              {filteredAgenda.slice(0, 4).map((item) => (
                <li key={`${item.source}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => onItemClick(item)}
                    className="calendar-event-pill w-full text-left"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-xl border-primary/30 bg-transparent text-primary hover:bg-primary-subtle"
          onClick={onTodayClick}
        >
          Go to today
        </Button>
      </div>
    </aside>
  );
}
