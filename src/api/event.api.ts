import { apiClient } from './api-client';
import type {
  CreateEventPayload,
  EventMutationResponse,
  EventRecord,
  ListEventsQuery,
  UpdateEventPayload,
} from '@/types/event.types';

export async function createEvent(payload: CreateEventPayload) {
  const response = await apiClient.post<EventMutationResponse<EventRecord>>('/events', payload);
  return response.data;
}

export async function listEvents(params?: ListEventsQuery) {
  const response = await apiClient.get<EventMutationResponse<EventRecord[]>>('/events', {
    params,
  });
  return response.data.data;
}

export async function getEvent(eventId: string) {
  const response = await apiClient.get<EventMutationResponse<EventRecord>>(`/events/${eventId}`);
  return response.data.data;
}

export async function updateEvent(eventId: string, payload: UpdateEventPayload) {
  const response = await apiClient.patch<EventMutationResponse<EventRecord>>(
    `/events/${eventId}`,
    payload,
  );
  return response.data;
}

export async function deleteEvent(eventId: string) {
  const response = await apiClient.delete<EventMutationResponse<null>>(`/events/${eventId}`);
  return response.data;
}
