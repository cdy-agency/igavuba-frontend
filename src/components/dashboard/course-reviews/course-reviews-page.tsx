'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Eye,
  FilePenLine,
  Search,
} from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCourseReviewQueue } from '@/hooks/use-course-review';
import { useCourseRevisionQueue } from '@/hooks/use-course-revision';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { CourseLifecycleStatus, COURSE_LIFECYCLE_LABELS } from '@/types/course-status';
import { CourseRevisionStatus, COURSE_REVISION_LABELS } from '@/types/course-revision';
import { getCourseStatusClassName } from '@/lib/course-utils';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { getRevisionBadgeClassName } from '@/lib/course-revision-feedback-context';
import type { CourseReviewQueueItem } from '@/types/course-review';
import type { CourseRevisionQueueItem } from '@/types/course-revision';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';
import { DashboardTableLoadingSkeleton } from '@/components/dashboard/shared/dashboard-skeletons';
import { cn } from '@/lib/utils';

const REVIEW_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.CONTENT_REVIEWER];

type QueueTab = 'initial' | 'revisions';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getCourseInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function CourseQueueIcon({ title }: { title: string }) {
  const initials = getCourseInitials(title);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/8 text-xs font-semibold text-primary">
      {initials || <BookOpen className="h-4 w-4" />}
    </div>
  );
}

function QueueTabs({
  tab,
  onChange,
}: {
  tab: QueueTab;
  onChange: (tab: QueueTab) => void;
}) {
  const tabs: { id: QueueTab; label: string }[] = [
    { id: 'initial', label: 'New submissions' },
    { id: 'revisions', label: 'Pending revisions' },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border/70 bg-muted/20 p-1">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            tab === item.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function CourseReviewsPage() {
  const authReady = useAuthReady();
  const [tab, setTab] = useState<QueueTab>('initial');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('UNDER_REVIEW');
  const [page, setPage] = useState(1);

  const initialParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: search.trim() || undefined,
      status: status === 'ALL' ? undefined : (status as CourseLifecycleStatus),
    }),
    [page, search, status],
  );

  const revisionParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: search.trim() || undefined,
      status: status === 'ALL' ? undefined : (status as CourseRevisionStatus),
    }),
    [page, search, status],
  );

  const { data: initialData, isPending: initialPending } = useCourseReviewQueue(
    initialParams,
    authReady && tab === 'initial',
  );
  const { data: revisionData, isPending: revisionPending } = useCourseRevisionQueue(
    revisionParams,
    authReady && tab === 'revisions',
  );

  const isPending = tab === 'initial' ? initialPending : revisionPending;
  const data = tab === 'initial' ? initialData : revisionData;
  const initialRows = initialData?.data ?? [];
  const revisionRows = revisionData?.data ?? [];
  const rows = tab === 'initial' ? initialRows : revisionRows;

  const handleTabChange = (nextTab: QueueTab) => {
    setTab(nextTab);
    setPage(1);
    setStatus('UNDER_REVIEW');
  };

  return (
    <RoleGuard allowedRoles={REVIEW_ROLES}>
      <div className="space-y-6">
        <PageHeader
          title="Course Reviews"
          description="Review new course submissions and pending revisions for published courses."
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <QueueTabs tab={tab} onChange={handleTabChange} />
          <p className="text-sm text-muted-foreground">
            {data?.pagination?.total ?? rows.length} item
            {(data?.pagination?.total ?? rows.length) === 1 ? '' : 's'} in queue
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by course title..."
              className="h-10 pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {tab === 'initial' ? (
                <>
                  <SelectItem value={CourseLifecycleStatus.UNDER_REVIEW}>
                    {COURSE_LIFECYCLE_LABELS[CourseLifecycleStatus.UNDER_REVIEW]}
                  </SelectItem>
                  <SelectItem value={CourseLifecycleStatus.CHANGES_REQUESTED}>
                    {COURSE_LIFECYCLE_LABELS[CourseLifecycleStatus.CHANGES_REQUESTED]}
                  </SelectItem>
                  <SelectItem value={CourseLifecycleStatus.APPROVED}>
                    {COURSE_LIFECYCLE_LABELS[CourseLifecycleStatus.APPROVED]}
                  </SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value={CourseRevisionStatus.UNDER_REVIEW}>
                    {COURSE_REVISION_LABELS[CourseRevisionStatus.UNDER_REVIEW]}
                  </SelectItem>
                  <SelectItem value={CourseRevisionStatus.CHANGES_REQUESTED}>
                    {COURSE_REVISION_LABELS[CourseRevisionStatus.CHANGES_REQUESTED]}
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          {isPending ? (
            <DashboardTableLoadingSkeleton
              columnCount={6}
              rowCount={6}
              showPagination={false}
              showToolbar={false}
            />
          ) : rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              {tab === 'initial'
                ? 'No courses in the review queue.'
                : 'No pending revisions.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-muted/25 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Institution</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tab === 'initial'
                    ? initialRows.map((course: CourseReviewQueueItem, index: number) => (
                        <tr
                          key={course.id}
                          className={cn(
                            'border-b border-border/60 transition-colors last:border-b-0',
                            index % 2 === 1 ? 'bg-primary/[0.03]' : 'bg-background',
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className="flex min-w-[12rem] items-center gap-3">
                              <CourseQueueIcon title={course.title} />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {course.title}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {course.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-foreground">{course.owner.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{course.owner.email}</p>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {course.institution.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                            {formatDate(course.submittedForReviewAt)}
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                                getCourseStatusClassName(course.status),
                              )}
                            >
                              {getCourseLifecycleLabel(course.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <DashboardActionGroup className="justify-end">
                              <DashboardActionIconButton
                                label="Review"
                                icon={Eye}
                                variant="primary"
                                href={`/dashboard/course-reviews/${course.slug}`}
                              />
                            </DashboardActionGroup>
                          </td>
                        </tr>
                      ))
                    : revisionRows.map((course: CourseRevisionQueueItem, index: number) => (
                        <tr
                          key={course.id}
                          className={cn(
                            'border-b border-border/60 transition-colors last:border-b-0',
                            index % 2 === 1 ? 'bg-primary/[0.03]' : 'bg-background',
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className="flex min-w-[12rem] items-center gap-3">
                              <CourseQueueIcon title={course.title} />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {course.title}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {course.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-foreground">{course.owner.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{course.owner.email}</p>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {course.institution.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                            {formatDate(course.submittedForReviewAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              <Badge
                                variant="outline"
                                className="rounded-full border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success"
                              >
                                Published
                              </Badge>
                              {course.revisionStatus ? (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                                    getRevisionBadgeClassName(course.revisionStatus),
                                  )}
                                >
                                  {COURSE_REVISION_LABELS[course.revisionStatus]}
                                </Badge>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <DashboardActionGroup className="justify-end">
                              <DashboardActionIconButton
                                label="Review revision"
                                icon={FilePenLine}
                                variant="primary"
                                href={`/dashboard/course-reviews/${course.slug}?type=revision`}
                              />
                            </DashboardActionGroup>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data?.pagination && data.pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
}
