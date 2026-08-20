import { apiClient } from './api-client';
import type { CalendarItem, CalendarQuery, EventMutationResponse } from '@/types/event.types';

export async function getCalendar(params: CalendarQuery) {
  const response = await apiClient.get<EventMutationResponse<CalendarItem[]>>('/calendar', {
    params,
  });
  return response.data.data;
}

export async function getUpcomingCalendar(params?: { limit?: number; courseId?: string }) {
  const response = await apiClient.get<EventMutationResponse<CalendarItem[]>>(
    '/calendar/upcoming',
    { params },
  );
  return response.data.data;
}
