'use client';

import { useMemo, useState } from 'react';
import {
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  startOfToday,
} from 'date-fns';
import { Loader2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { EventDetailModal } from '@/components/dashboard/events/event-detail-modal';
import { EventFormModal } from '@/components/dashboard/events/event-form-modal';
import { CalendarSidebar } from '@/components/dashboard/calendar/calendar-sidebar';
import { CalendarMonthGrid } from '@/components/dashboard/calendar/calendar-month-grid';
import { useCalendar, useUpcomingCalendar } from '@/hooks/use-calendar';
import { useDashboard } from '@/contexts/dashboard-context';
import type { CalendarItem } from '@/types/event.types';
import { UserRole } from '@/types/enum';
import { cn } from '@/lib/utils';

const CALENDAR_ROLES = Object.values(UserRole);

type CalendarView = 'month' | 'upcoming';

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'upcoming', label: 'Upcoming' },
];

function sourceTone(source: CalendarItem['source']) {
  if (source === 'EVENT') return 'bg-primary-subtle text-primary';
  if (source === 'ASSIGNMENT') return 'bg-accent/15 text-accent';
  if (source === 'EXAM') return 'bg-destructive/10 text-destructive';
  return 'bg-muted text-muted-foreground';
}

export function CalendarPage() {
  const { role } = useDashboard();
  const [view, setView] = useState<CalendarView>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const canCreate =
    role === UserRole.INSTITUTION_ADMIN ||
    role === UserRole.LECTURER ||
    role === UserRole.LEARNER ||
    role === UserRole.SUPER_ADMIN;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const calendarQuery = useMemo(
    () => ({
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
      sources: sourceFilter === 'all' ? undefined : sourceFilter,
    }),
    [monthStart, monthEnd, sourceFilter],
  );

  const { data: monthItemsData, isLoading: monthLoading } = useCalendar(
    calendarQuery,
    view === 'month',
  );
  const monthItems: CalendarItem[] = monthItemsData ?? [];
  const { data: upcomingItemsData, isLoading: upcomingLoading } = useUpcomingCalendar(
    20,
    undefined,
    view === 'upcoming',
  );
  const upcomingItems: CalendarItem[] = upcomingItemsData ?? [];

  const selectedDayItems = monthItems.filter((item) =>
    isSameDay(new Date(item.startAt), selectedDay),
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of monthItems) {
      const key = format(new Date(item.startAt), 'yyyy-MM-dd');
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
  }, [monthItems]);

  const filteredUpcoming = upcomingItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const handleSelectDay = (day: Date) => {
    setSelectedDay(day);
    if (day.getMonth() !== currentMonth.getMonth() || day.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(startOfMonth(day));
    }
  };

  const handleTodayClick = () => {
    const today = startOfToday();
    setSelectedDay(today);
    setCurrentMonth(startOfMonth(today));
  };

  return (
    <RoleGuard allowedRoles={CALENDAR_ROLES}>
      <div className="calendar-page">
        <div className="calendar-shell">
          <div className="flex shrink-0 flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Events, deadlines, exams, and unlock dates in one view.
              </p>
            </div>

            <div className="calendar-view-toggle" role="tablist" aria-label="Calendar view">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={view === option.value}
                  onClick={() => setView(option.value)}
                  className={cn(
                    'calendar-view-toggle__item',
                    view === option.value && 'calendar-view-toggle__item--active',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-body">
            <CalendarSidebar
              currentMonth={currentMonth}
              selectedDay={selectedDay}
              sourceFilter={sourceFilter}
              canCreate={canCreate}
              selectedDayItems={selectedDayItems}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreateClick={() => setCreateOpen(true)}
              onSourceFilterChange={setSourceFilter}
              onSelectDay={handleSelectDay}
              onMonthChange={setCurrentMonth}
              onTodayClick={handleTodayClick}
              onItemClick={setSelectedItem}
            />

            <div className="calendar-main">
              {view === 'month' ? (
                <CalendarMonthGrid
                  currentMonth={currentMonth}
                  selectedDay={selectedDay}
                  itemsByDay={itemsByDay}
                  isLoading={monthLoading}
                  onMonthChange={setCurrentMonth}
                  onSelectDay={handleSelectDay}
                  onItemClick={setSelectedItem}
                />
              ) : (
                <div className="flex min-h-[24rem] flex-col">
                  <div className="border-b border-border/60 px-5 py-4">
                    <h2 className="text-base font-semibold text-foreground">Upcoming</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Next items on your calendar
                    </p>
                  </div>

                  {upcomingLoading ? (
                    <div className="flex flex-1 items-center justify-center py-24">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    </div>
                  ) : filteredUpcoming.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-muted-foreground">
                      Nothing upcoming on your calendar.
                    </div>
                  ) : (
                    <ul className="divide-y divide-border/60">
                      {filteredUpcoming.map((item) => (
                        <li key={`${item.source}-${item.id}`}>
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-subtle/30"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{item.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {format(new Date(item.startAt), 'PPP · p')}
                                {item.courseTitle ? ` · ${item.courseTitle}` : ''}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                sourceTone(item.source),
                              )}
                            >
                              {item.source.replaceAll('_', ' ')}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <EventFormModal open={createOpen} onOpenChange={setCreateOpen} />
        <EventDetailModal
          open={Boolean(selectedItem)}
          onOpenChange={(open) => !open && setSelectedItem(null)}
          calendarItem={selectedItem}
        />
      </div>
    </RoleGuard>
  );
}
