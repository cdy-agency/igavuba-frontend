export type EventScope = 'COURSE' | 'INSTITUTION' | 'PERSONAL';

export type EventType =
  | 'LECTURE'
  | 'REVISION'
  | 'WORKSHOP'
  | 'MEETING'
  | 'PRESENTATION'
  | 'PRACTICAL'
  | 'ORIENTATION'
  | 'OTHER';

export type EventStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export type CalendarItemSource =
  | 'EVENT'
  | 'ASSIGNMENT'
  | 'EXAM'
  | 'QUIZ'
  | 'CONTENT_UNLOCK';

export interface EventCourseSummary {
  id: string;
  title: string;
  slug: string;
}

export interface EventInstitutionSummary {
  id: string;
  name: string;
}

export interface EventCreatorSummary {
  id: string;
  name: string | null;
  email: string;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string | null;
  eventType: EventType;
  scope: EventScope;
  institutionId: string | null;
  courseId: string | null;
  createdById: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string | null;
  meetingUrl: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  course: EventCourseSummary | null;
  institution: EventInstitutionSummary | null;
  createdBy: EventCreatorSummary;
}

export interface CalendarItem {
  id: string;
  source: CalendarItemSource;
  title: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  allDay?: boolean;
  eventType?: EventType;
  scope?: EventScope;
  courseId?: string | null;
  courseTitle?: string | null;
  courseSlug?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  assessmentType?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  eventType: EventType;
  scope: EventScope;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  location?: string;
  meetingUrl?: string;
  courseId?: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  eventType?: EventType;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  location?: string | null;
  meetingUrl?: string | null;
  status?: EventStatus;
}

export interface ListEventsQuery {
  scope?: EventScope;
  courseId?: string;
  eventType?: EventType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  searchq?: string;
}

export interface CalendarQuery {
  startDate: string;
  endDate: string;
  courseId?: string;
  sources?: string;
}

export interface EventMutationResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
