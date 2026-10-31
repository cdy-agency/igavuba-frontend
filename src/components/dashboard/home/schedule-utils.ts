import { format, isToday, isTomorrow } from 'date-fns';
import { filterUpcomingCalendarItems } from '@/lib/calendar-item-utils';
import type { CalendarItem, CalendarItemSource } from '@/types/event.types';

export const DEADLINE_SOURCES: CalendarItemSource[] = ['ASSIGNMENT', 'EXAM', 'QUIZ'];

export function isDeadlineItem(item: CalendarItem) {
  return DEADLINE_SOURCES.includes(item.source);
}

export function isEventItem(item: CalendarItem) {
  return item.source === 'EVENT';
}

export function filterDeadlineItems(items: CalendarItem[]) {
  return filterUpcomingCalendarItems(items.filter(isDeadlineItem)).sort(sortByStartAt);
}

export function filterEventItems(items: CalendarItem[]) {
  return filterUpcomingCalendarItems(items.filter(isEventItem)).sort(sortByStartAt);
}

function sortByStartAt(left: CalendarItem, right: CalendarItem) {
  return new Date(left.startAt).getTime() - new Date(right.startAt).getTime();
}

export function formatScheduleWhen(iso: string, allDay?: boolean) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  if (allDay) {
    if (isToday(date)) return 'Today · All day';
    if (isTomorrow(date)) return 'Tomorrow · All day';
    return `${format(date, 'MMM d')} · All day`;
  }

  if (isToday(date)) return `Today · ${format(date, 'p')}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, 'p')}`;
  return format(date, 'MMM d · p');
}

export function getScheduleSourceLabel(item: CalendarItem) {
  if (item.source === 'EVENT') {
    return item.eventType?.replaceAll('_', ' ') ?? 'Event';
  }
  if (item.source === 'ASSIGNMENT') return 'Assignment';
  if (item.source === 'EXAM') return 'Exam';
  if (item.source === 'QUIZ') return 'Quiz';
  return item.source.replaceAll('_', ' ');
}

export function getScheduleItemHref(item: CalendarItem) {
  if (item.source === 'EVENT' && item.meetingUrl) {
    return item.meetingUrl;
  }
  if (item.courseSlug) {
    return `/learn/${item.courseSlug}`;
  }
  return '/dashboard/calendar';
}

export function isExternalScheduleHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}
