'use client';

import { useQuery } from '@tanstack/react-query';
import { getCalendar, getUpcomingCalendar } from '@/api/calendar.api';
import type { CalendarItem, CalendarQuery } from '@/types/event.types';

export const calendarQueryKeys = {
  range: (params: CalendarQuery) =>
    ['calendar', params.startDate, params.endDate, params.courseId ?? '', params.sources ?? ''] as const,
  upcoming: (limit?: number, courseId?: string) =>
    ['calendar', 'upcoming', limit ?? 10, courseId ?? ''] as const,
};

export function useCalendar(params: CalendarQuery, enabled = true) {
  return useQuery<CalendarItem[]>({
    queryKey: calendarQueryKeys.range(params),
    queryFn: () => getCalendar(params),
    enabled: enabled && Boolean(params.startDate && params.endDate),
  });
}

export function useUpcomingCalendar(limit = 10, courseId?: string, enabled = true) {
  return useQuery<CalendarItem[]>({
    queryKey: calendarQueryKeys.upcoming(limit, courseId),
    queryFn: () => getUpcomingCalendar({ limit, courseId }),
    enabled,
  });
}
