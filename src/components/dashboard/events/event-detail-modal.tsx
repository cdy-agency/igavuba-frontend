'use client';

import { format } from 'date-fns';
import { ExternalLink, MapPin, User } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ModernStatusBadge } from '@/components/dashboard/shared/modern-table';
import type { CalendarItem, EventRecord } from '@/types/event.types';

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground sm:max-w-[65%] sm:text-right">{value}</dd>
    </div>
  );
}

export function EventDetailModal({
  open,
  onOpenChange,
  event,
  calendarItem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventRecord | null;
  calendarItem?: CalendarItem | null;
}) {
  const title = event?.title ?? calendarItem?.title ?? 'Event details';
  const startAt = event?.startAt ?? calendarItem?.startAt;
  const endAt = event?.endAt ?? calendarItem?.endAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {event?.scope
              ? `${event.scope.charAt(0)}${event.scope.slice(1).toLowerCase()} event`
              : calendarItem?.source.replaceAll('_', ' ').toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-3">
          {event?.eventType || calendarItem?.eventType ? (
            <DetailRow
              label="Type"
              value={
                <ModernStatusBadge
                  label={(event?.eventType ?? calendarItem?.eventType ?? '').replaceAll('_', ' ')}
                  tone="info"
                />
              }
            />
          ) : null}

          {startAt ? (
            <DetailRow
              label="Start"
              value={format(new Date(startAt), 'PPP p')}
            />
          ) : null}

          {endAt ? (
            <DetailRow label="End" value={format(new Date(endAt), 'PPP p')} />
          ) : null}

          {event?.location || calendarItem?.location ? (
            <DetailRow
              label="Location"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {event?.location ?? calendarItem?.location}
                </span>
              }
            />
          ) : null}

          {(event?.meetingUrl || calendarItem?.meetingUrl) ? (
            <DetailRow
              label="Meeting link"
              value={
                <a
                  href={event?.meetingUrl ?? calendarItem?.meetingUrl ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  Join meeting
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              }
            />
          ) : null}

          {event?.course || calendarItem?.courseTitle ? (
            <DetailRow
              label="Course"
              value={event?.course?.title ?? calendarItem?.courseTitle ?? '—'}
            />
          ) : null}

          {event?.institution ? (
            <DetailRow label="Institution" value={event.institution.name} />
          ) : null}

          {event?.createdBy ? (
            <DetailRow
              label="Created by"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {event.createdBy.name ?? event.createdBy.email}
                </span>
              }
            />
          ) : null}

          {event?.description || calendarItem?.description ? (
            <DetailRow
              label="Description"
              value={event?.description ?? calendarItem?.description ?? '—'}
            />
          ) : null}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
