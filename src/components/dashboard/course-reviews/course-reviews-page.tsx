'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { cn } from '@/lib/utils';

const REVIEW_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

type QueueTab = 'initial' | 'revisions';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
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

  return (
    <RoleGuard allowedRoles={REVIEW_ROLES}>
      <div className="space-y-6">
        <PageHeader
          title="Course Reviews"
          description="Review new course submissions and pending revisions for published courses."
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={tab === 'initial' ? 'default' : 'outline'}
            onClick={() => {
              setTab('initial');
              setPage(1);
              setStatus('UNDER_REVIEW');
            }}
          >
            New submissions
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === 'revisions' ? 'default' : 'outline'}
            onClick={() => {
              setTab('revisions');
              setPage(1);
              setStatus('UNDER_REVIEW');
            }}
          >
            Pending revisions
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search courses..."
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All review statuses</SelectItem>
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

        <div className="rounded-lg border border-border/80 bg-card">
          {isPending ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      {tab === 'initial'
                        ? 'No courses in the review queue.'
                        : 'No pending revisions.'}
                    </TableCell>
                  </TableRow>
                ) : tab === 'initial' ? (
                  (data?.data ?? []).map((course: CourseReviewQueueItem) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>
                        <div className="text-sm">{course.owner.name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{course.owner.email}</div>
                      </TableCell>
                      <TableCell>{course.institution.name}</TableCell>
                      <TableCell>{formatDate(course.submittedForReviewAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-[11px]', getCourseStatusClassName(course.status))}
                        >
                          {getCourseLifecycleLabel(course.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/course-reviews/${course.slug}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Review
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  (data?.data ?? []).map((course: CourseRevisionQueueItem) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>
                        <div className="text-sm">{course.owner.name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{course.owner.email}</div>
                      </TableCell>
                      <TableCell>{course.institution.name}</TableCell>
                      <TableCell>{formatDate(course.submittedForReviewAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[11px] border-success/30 text-success"
                          >
                            Published
                          </Badge>
                          {course.revisionStatus ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[11px]',
                                getRevisionBadgeClassName(course.revisionStatus),
                              )}
                            >
                              {COURSE_REVISION_LABELS[course.revisionStatus]}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/course-reviews/${course.slug}?type=revision`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Review revision
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {data?.pagination && data.pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
}
