'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Loader2 } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker, toDatetimeLocalValue } from '@/components/ui/date-time-picker';
import { useCreateEvent, useUpdateEvent } from '@/hooks/use-events';
import { useCoursesList } from '@/hooks/use-courses';
import { useDashboard } from '@/contexts/dashboard-context';
import type { Course } from '@/types/course';
import type { EventRecord, EventScope, EventType } from '@/types/event.types';
import { UserRole } from '@/types/enum';
import { CourseLifecycleStatus } from '@/types/course-status';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'LECTURE', label: 'Lecture' },
  { value: 'REVISION', label: 'Revision' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'PRACTICAL', label: 'Practical' },
  { value: 'ORIENTATION', label: 'Orientation' },
  { value: 'OTHER', label: 'Other' },
];

const scopeHelper: Record<EventScope, string> = {
  COURSE: 'Visible to learners enrolled in the selected course.',
  INSTITUTION: 'Visible to users in your institution.',
  PERSONAL: 'Only you can see this event.',
};

const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(5000).optional(),
    eventType: z.enum([
      'LECTURE',
      'REVISION',
      'WORKSHOP',
      'MEETING',
      'PRESENTATION',
      'PRACTICAL',
      'ORIENTATION',
      'OTHER',
    ]),
    scope: z.enum(['COURSE', 'INSTITUTION', 'PERSONAL']),
    courseId: z.string().optional(),
    startAt: z.string().min(1, 'Start time is required'),
    endAt: z.string().min(1, 'End time is required'),
    allDay: z.boolean().default(false),
    location: z.string().trim().max(500).optional(),
    meetingUrl: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  })
  .superRefine((values, ctx) => {
    if (values.scope === 'COURSE' && !values.courseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Course is required for course events',
        path: ['courseId'],
      });
    }
    if (values.startAt && values.endAt && new Date(values.endAt) <= new Date(values.startAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endAt'],
      });
    }
  });

type EventFormValues = z.infer<typeof eventFormSchema>;

export function EventFormModal({
  open,
  onOpenChange,
  event,
  defaultScope,
  defaultCourseId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventRecord | null;
  defaultScope?: EventScope;
  defaultCourseId?: string;
}) {
  const { role } = useDashboard();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(event?.id ?? '');
  const isEdit = Boolean(event);
  const isPending = createEvent.isPending || updateEvent.isPending;

  const canCreateInstitution = role === UserRole.INSTITUTION_ADMIN || role === UserRole.SUPER_ADMIN;
  const canCreateCourse =
    role === UserRole.INSTITUTION_ADMIN ||
    role === UserRole.LECTURER ||
    role === UserRole.SUPER_ADMIN;

  const { data: coursesData } = useCoursesList(
    { page: 1, limit: 100, status: CourseLifecycleStatus.PUBLISHED },
    open && canCreateCourse,
  );
  const courses: Course[] = coursesData?.data ?? [];

  const availableScopes = useMemo(() => {
    const scopes: EventScope[] = ['PERSONAL'];
    if (canCreateCourse) scopes.unshift('COURSE');
    if (canCreateInstitution) scopes.unshift('INSTITUTION');
    return scopes;
  }, [canCreateCourse, canCreateInstitution]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: 'REVISION',
      scope: defaultScope ?? 'PERSONAL',
      courseId: defaultCourseId,
      startAt: '',
      endAt: '',
      allDay: false,
      location: '',
      meetingUrl: '',
    },
  });

  const scope = form.watch('scope');

  useEffect(() => {
    if (!open) {
      form.reset({
        title: '',
        description: '',
        eventType: 'REVISION',
        scope: defaultScope ?? 'PERSONAL',
        courseId: defaultCourseId,
        startAt: '',
        endAt: '',
        allDay: false,
        location: '',
        meetingUrl: '',
      });
      return;
    }

    if (event) {
      form.reset({
        title: event.title,
        description: event.description ?? '',
        eventType: event.eventType,
        scope: event.scope,
        courseId: event.courseId ?? undefined,
        startAt: toDatetimeLocalValue(event.startAt),
        endAt: toDatetimeLocalValue(event.endAt),
        allDay: event.allDay,
        location: event.location ?? '',
        meetingUrl: event.meetingUrl ?? '',
      });
    }
  }, [open, event, form, defaultScope, defaultCourseId]);

  const onSubmit = async (values: EventFormValues) => {
    const payload = {
      title: values.title,
      description: values.description?.trim() || undefined,
      eventType: values.eventType,
      scope: values.scope,
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
      allDay: values.allDay,
      location: values.location?.trim() || undefined,
      meetingUrl: values.meetingUrl?.trim() || undefined,
      courseId: values.scope === 'COURSE' ? values.courseId : undefined,
    };

    if (isEdit) {
      await updateEvent.mutateAsync(payload);
    } else {
      await createEvent.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/30 px-6 py-5 pr-12">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <DialogTitle>{isEdit ? 'Edit Event' : 'Create Event'}</DialogTitle>
              <DialogDescription>
                {scopeHelper[scope] ?? 'Schedule an academic or personal event.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Event title</Label>
              <Input
                id="event-title"
                disabled={isPending}
                placeholder="e.g. Midterm revision session"
                {...form.register('title')}
              />
              {form.formState.errors.title ? (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Event type</Label>
                <Select
                  value={form.watch('eventType')}
                  onValueChange={(value) => form.setValue('eventType', value as EventType)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!isEdit ? (
                <div className="space-y-1.5">
                  <Label>Scope</Label>
                  <Select
                    value={scope}
                    onValueChange={(value) => form.setValue('scope', value as EventScope)}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableScopes.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0) + option.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>

            {scope === 'COURSE' ? (
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select
                  value={form.watch('courseId') ?? ''}
                  onValueChange={(value) => form.setValue('courseId', value)}
                  disabled={isPending || Boolean(defaultCourseId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.courseId ? (
                  <p className="text-xs text-destructive">{form.formState.errors.courseId.message}</p>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Start</Label>
                <DateTimePicker
                  value={form.watch('startAt')}
                  onChange={(value) => form.setValue('startAt', value)}
                  disabled={isPending}
                  placeholder="Select start date and time"
                />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <DateTimePicker
                  value={form.watch('endAt')}
                  onChange={(value) => form.setValue('endAt', value)}
                  disabled={isPending}
                  placeholder="Select end date and time"
                />
                {form.formState.errors.endAt ? (
                  <p className="text-xs text-destructive">{form.formState.errors.endAt.message}</p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="event-all-day"
                checked={form.watch('allDay')}
                onCheckedChange={(checked) => form.setValue('allDay', checked === true)}
                disabled={isPending}
              />
              <Label htmlFor="event-all-day">All day</Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  disabled={isPending}
                  placeholder="e.g. Room 204 or Main Auditorium"
                  {...form.register('location')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-meeting-url">Meeting URL</Label>
                <Input
                  id="event-meeting-url"
                  disabled={isPending}
                  placeholder="https://meet.google.com/..."
                  {...form.register('meetingUrl')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                rows={4}
                disabled={isPending}
                placeholder="Add details about this event..."
                {...form.register('description')}
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border/60 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEdit ? 'Save changes' : 'Create event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
