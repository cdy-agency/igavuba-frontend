import type { CalendarItem, EventRecord, EventStatus, EventType } from '@/types/event.types';

const SESSION_EVENT_TYPES = new Set<EventType>([
  'LECTURE',
  'REVISION',
  'WORKSHOP',
  'MEETING',
  'PRESENTATION',
  'PRACTICAL',
  'ORIENTATION',
]);

const MAX_REASONABLE_SESSION_MS = 12 * 60 * 60 * 1000;
const DEFAULT_SESSION_MS = 2 * 60 * 60 * 1000;

type ExpiryItem = Pick<CalendarItem, 'startAt' | 'endAt' | 'allDay' | 'source' | 'eventType'> & {
  status?: EventStatus;
};

export function getCalendarItemEffectiveEnd(item: ExpiryItem): Date {
  if (item.status === 'COMPLETED' || item.status === 'CANCELLED') {
    return new Date(0);
  }

  if (item.allDay) {
    const end = new Date(item.startAt);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  const start = new Date(item.startAt);
  const end = new Date(item.endAt ?? item.startAt);
  const durationMs = end.getTime() - start.getTime();

  const isSessionEvent =
    item.source === 'EVENT' &&
    item.eventType &&
    SESSION_EVENT_TYPES.has(item.eventType);

  // Sessions with an unrealistic end date (e.g. months after start) expire after the session slot.
  if (isSessionEvent && durationMs > MAX_REASONABLE_SESSION_MS) {
    return new Date(start.getTime() + DEFAULT_SESSION_MS);
  }

  return end;
}

export function isCalendarItemPast(item: ExpiryItem, now = new Date()): boolean {
  return getCalendarItemEffectiveEnd(item).getTime() < now.getTime();
}

export function isEventPast(
  event: Pick<EventRecord, 'startAt' | 'endAt' | 'allDay' | 'eventType' | 'status'>,
  now = new Date(),
) {
  return isCalendarItemPast(
    {
      startAt: event.startAt,
      endAt: event.endAt,
      allDay: event.allDay,
      source: 'EVENT',
      eventType: event.eventType,
      status: event.status,
    },
    now,
  );
}

export function filterUpcomingCalendarItems<T extends ExpiryItem>(items: T[], now = new Date()): T[] {
  return items.filter((item) => !isCalendarItemPast(item, now));
}
