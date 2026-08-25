'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from '@/api/event.api';
import type {
  CreateEventPayload,
  EventRecord,
  ListEventsQuery,
  UpdateEventPayload,
} from '@/types/event.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const eventQueryKeys = {
  list: (params?: ListEventsQuery) =>
    [
      'events',
      params?.scope ?? '',
      params?.courseId ?? '',
      params?.eventType ?? '',
      params?.startDate ?? '',
      params?.endDate ?? '',
      params?.searchq ?? '',
      params?.page ?? 1,
    ] as const,
  detail: (id: string) => ['events', 'detail', id] as const,
};

export function useEventsList(params?: ListEventsQuery, enabled = true) {
  return useQuery<EventRecord[]>({
    queryKey: eventQueryKeys.list(params),
    queryFn: () => listEvents(params),
    enabled,
  });
}

export function useEvent(eventId: string, enabled = true) {
  return useQuery<EventRecord>({
    queryKey: eventQueryKeys.detail(eventId),
    queryFn: () => getEvent(eventId),
    enabled: Boolean(eventId) && enabled,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Event created successfully.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to create event.')),
  });
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEventPayload) => updateEvent(eventId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Event updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to update event.')),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: (response) => {
      toast.success(response.message || 'Event deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to delete event.')),
  });
}
