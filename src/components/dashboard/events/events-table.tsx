'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CalendarPlus, Filter, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ModernFilterSelect,
  ModernStatusBadge,
  ModernTable,
  ModernTableBody,
  ModernTableCell,
  ModernTableEmpty,
  ModernTableHead,
  ModernTableHeaderCell,
  ModernTableRow,
  ModernTableShell,
  ModernTableToolbar,
} from '@/components/dashboard/shared/modern-table';
import { EventDetailModal } from '@/components/dashboard/events/event-detail-modal';
import { EventFormModal } from '@/components/dashboard/events/event-form-modal';
import { useDeleteEvent, useEventsList } from '@/hooks/use-events';
import { useDashboard } from '@/contexts/dashboard-context';
import type { EventRecord, EventScope, EventType } from '@/types/event.types';
import { UserRole } from '@/types/enum';
import {
  dashboardActionGroupClass,
  getDashboardLabeledActionButtonClass,
} from '@/lib/dashboard-action-button';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'LECTURE', label: 'Lecture' },
  { value: 'REVISION', label: 'Revision' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'PRACTICAL', label: 'Practical' },
  { value: 'ORIENTATION', label: 'Orientation' },
  { value: 'OTHER', label: 'Other' },
];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All scopes' },
  { value: 'COURSE', label: 'Course' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'PERSONAL', label: 'Personal' },
];

export function EventsTable({
  courseId,
  defaultScope,
}: {
  courseId?: string;
  defaultScope?: EventScope;
}) {
  const { role } = useDashboard();
  const canManage =
    role === UserRole.INSTITUTION_ADMIN ||
    role === UserRole.LECTURER ||
    role === UserRole.SUPER_ADMIN;

  const [searchInput, setSearchInput] = useState('');
  const [scopeFilter, setScopeFilter] = useState(defaultScope ?? 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventRecord | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  const queryParams = useMemo(
    () => ({
      searchq: searchInput.trim() || undefined,
      scope: scopeFilter === 'all' ? undefined : (scopeFilter as EventScope),
      eventType: typeFilter === 'all' ? undefined : (typeFilter as EventType),
      courseId,
      limit: 50,
    }),
    [searchInput, scopeFilter, typeFilter, courseId],
  );

  const { data: eventsData, isLoading } = useEventsList(queryParams);
  const events: EventRecord[] = eventsData ?? [];
  const deleteEvent = useDeleteEvent();

  const filterCount = (scopeFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0);

  return (
    <>
      <ModernTableShell>
        <ModernTableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search events..."
          filterCount={filterCount}
          onClearFilters={() => {
            setScopeFilter(defaultScope ?? 'all');
            setTypeFilter('all');
          }}
          filters={
            <>
              {!courseId ? (
                <ModernFilterSelect
                  icon={Filter}
                  label="Scope"
                  value={scopeFilter}
                  onValueChange={setScopeFilter}
                  options={SCOPE_OPTIONS}
                />
              ) : null}
              <ModernFilterSelect
                icon={Filter}
                label="Type"
                value={typeFilter}
                onValueChange={setTypeFilter}
                options={TYPE_OPTIONS}
              />
            </>
          }
          actions={
            canManage ? (
              <div className={dashboardActionGroupClass}>
                <Button
                  type="button"
                  size="sm"
                  className={getDashboardLabeledActionButtonClass()}
                  onClick={() => setCreateOpen(true)}
                >
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                  Create Event
                </Button>
              </div>
            ) : null
          }
        />

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <ModernTableEmpty message="No events found for the selected filters." />
        ) : (
          <ModernTable>
            <ModernTableHead>
              <ModernTableHeaderCell>Event</ModernTableHeaderCell>
              <ModernTableHeaderCell>Type</ModernTableHeaderCell>
              <ModernTableHeaderCell>Scope</ModernTableHeaderCell>
              <ModernTableHeaderCell>When</ModernTableHeaderCell>
              <ModernTableHeaderCell className="text-right">Actions</ModernTableHeaderCell>
            </ModernTableHead>
            <ModernTableBody>
              {events.map((row) => (
                <ModernTableRow key={row.id}>
                  <ModernTableCell>
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => setSelectedEvent(row)}
                    >
                      <p className="font-medium text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.course?.title ?? row.institution?.name ?? 'Personal event'}
                      </p>
                    </button>
                  </ModernTableCell>
                  <ModernTableCell>
                    <ModernStatusBadge label={row.eventType.replaceAll('_', ' ')} tone="info" />
                  </ModernTableCell>
                  <ModernTableCell className="capitalize text-muted-foreground">
                    {row.scope.toLowerCase()}
                  </ModernTableCell>
                  <ModernTableCell className="whitespace-nowrap text-muted-foreground">
                    {format(new Date(row.startAt), 'MMM d, yyyy · h:mm a')}
                  </ModernTableCell>
                  <ModernTableCell className="text-right">
                    {canManage ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedEvent(row)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditEvent(row)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => void deleteEvent.mutateAsync(row.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedEvent(row)}>
                        View
                      </Button>
                    )}
                  </ModernTableCell>
                </ModernTableRow>
              ))}
            </ModernTableBody>
          </ModernTable>
        )}
      </ModernTableShell>

      <EventFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultScope={courseId ? 'COURSE' : defaultScope}
        defaultCourseId={courseId}
      />
      <EventFormModal open={Boolean(editEvent)} onOpenChange={(open) => !open && setEditEvent(null)} event={editEvent} />
      <EventDetailModal
        open={Boolean(selectedEvent)}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        event={selectedEvent}
      />
    </>
  );
}
