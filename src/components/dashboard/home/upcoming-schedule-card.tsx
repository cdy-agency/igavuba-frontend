'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  Video,
} from 'lucide-react';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useUpcomingCalendar } from '@/hooks/use-calendar';
import type { CalendarItem } from '@/types/event.types';
import { cn } from '@/lib/utils';
import {
  filterDeadlineItems,
  filterEventItems,
  formatScheduleWhen,
  getScheduleItemHref,
  getScheduleSourceLabel,
  isExternalScheduleHref,
} from './schedule-utils';

type ScheduleVariant = 'deadlines' | 'events';

interface UpcomingScheduleCardProps {
  variant: ScheduleVariant;
  limit?: number;
  hideWhenEmpty?: boolean;
  className?: string;
}

const VARIANT_CONFIG: Record<
  ScheduleVariant,
  { title: string; subtitle: string; emptyMessage: string; viewAllHref: string }
> = {
  deadlines: {
    title: 'Upcoming deadlines',
    subtitle: 'Assignments, exams, and quizzes due soon',
    emptyMessage: 'No upcoming deadlines.',
    viewAllHref: '/dashboard/calendar',
  },
  events: {
    title: 'Scheduled sessions',
    subtitle: 'Meetings, lectures, and live classes',
    emptyMessage: 'No sessions scheduled.',
    viewAllHref: '/dashboard/calendar',
  },
};

function sourceIcon(item: CalendarItem) {
  if (item.source === 'EVENT') return Video;
  if (item.source === 'EXAM') return ClipboardList;
  if (item.source === 'QUIZ') return ClipboardList;
  return FileText;
}

function sourceAccent(item: CalendarItem) {
  if (item.source === 'EVENT') return 'bg-primary/10 text-primary';
  if (item.source === 'EXAM') return 'bg-destructive/10 text-destructive';
  if (item.source === 'QUIZ') return 'bg-violet-500/10 text-violet-600 dark:text-violet-400';
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
}

function ScheduleRow({ item }: { item: CalendarItem }) {
  const Icon = sourceIcon(item);
  const href = getScheduleItemHref(item);
  const external = isExternalScheduleHref(href);
  const whenLabel = formatScheduleWhen(item.startAt, item.allDay);
  const sourceLabel = getScheduleSourceLabel(item);

  const content = (
    <>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center',
          sourceAccent(item),
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {whenLabel}
          {item.courseTitle ? ` · ${item.courseTitle}` : ''}
        </p>
      </div>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {sourceLabel}
      </span>
      {external ? <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}
    </>
  );

  const rowClassName =
    'flex items-center gap-3 border-b border-border/50 px-3 py-2.5 last:border-b-0 transition-colors hover:bg-muted/30';

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={rowClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={rowClassName}>
      {content}
    </Link>
  );
}

export function UpcomingScheduleCard({
  variant,
  limit = 4,
  hideWhenEmpty = false,
  className,
}: UpcomingScheduleCardProps) {
  const authReady = useAuthReady();
  const config = VARIANT_CONFIG[variant];
  const fetchLimit = Math.max(limit * 3, 12);

  const { data: upcomingItems = [], isPending } = useUpcomingCalendar(
    fetchLimit,
    undefined,
    authReady,
  );

  const items = useMemo(() => {
    const filtered =
      variant === 'deadlines'
        ? filterDeadlineItems(upcomingItems)
        : filterEventItems(upcomingItems);
    return filtered.slice(0, limit);
  }, [limit, upcomingItems, variant]);

  if (!isPending && hideWhenEmpty && items.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'overflow-hidden border border-border/60 bg-card shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{config.subtitle}</p>
        </div>
        <Link
          href={config.viewAllHref}
          className="shrink-0 text-[11px] font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {isPending ? (
        <div className="flex h-28 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <CalendarDays className="mb-2 h-7 w-7 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">{config.emptyMessage}</p>
          <Link
            href={config.viewAllHref}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            Open calendar
          </Link>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <ScheduleRow key={`${item.source}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
