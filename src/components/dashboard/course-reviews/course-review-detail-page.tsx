'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ExternalLink, Loader2, MessageSquare } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useApproveCourseReview,
  useCourseReviewDetail,
  useCourseReviewHistory,
  useRequestCourseChanges,
} from '@/hooks/use-course-review';
import {
  useApproveCourseRevision,
  useCourseRevisionCompare,
  useRequestCourseRevisionChanges,
} from '@/hooks/use-course-revision';
import { useCourseDetail, usePublishCourse } from '@/hooks/use-courses';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { CourseLifecycleStatus } from '@/types/course-status';
import { CourseRevisionStatus, COURSE_REVISION_LABELS } from '@/types/course-revision';
import { CourseReviewDecision } from '@/types/course-review';
import type { CourseReviewDetail, CourseReviewRecord } from '@/types/course-review';
import { getCourseStatusClassName } from '@/lib/course-utils';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { getRevisionBadgeClassName } from '@/lib/course-revision-feedback-context';
import { cn } from '@/lib/utils';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';
import { RequestChangesModal } from '@/components/dashboard/course-reviews/request-changes-modal';

const REVIEW_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function contentTypeLabel(type: string) {
  switch (type) {
    case 'QUIZ':
      return 'Quiz';
    case 'ASSIGNMENT':
      return 'Assignment';
    case 'VIDEO':
      return 'Video';
    case 'DOCUMENT':
      return 'Document';
    default:
      return 'Lesson';
  }
}

function decisionLabel(decision: CourseReviewDecision) {
  switch (decision) {
    case CourseReviewDecision.SUBMITTED:
      return 'Submitted for review';
    case CourseReviewDecision.RESUBMITTED:
      return 'Resubmitted';
    case CourseReviewDecision.APPROVED:
      return 'Approved';
    case CourseReviewDecision.CHANGES_REQUESTED:
      return 'Changes requested';
    case CourseReviewDecision.REVISION_SUBMITTED:
      return 'Revision submitted';
    case CourseReviewDecision.REVISION_RESUBMITTED:
      return 'Revision resubmitted';
    case CourseReviewDecision.REVISION_APPROVED:
      return 'Revision approved';
    case CourseReviewDecision.REVISION_CHANGES_REQUESTED:
      return 'Revision changes requested';
    default:
      return decision;
  }
}

function ComparisonList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-md border border-border/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CourseReviewDetailPage({
  courseId,
  reviewType = 'initial',
}: {
  courseId: string;
  reviewType?: 'initial' | 'revision';
}) {
  const authReady = useAuthReady();
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const isRevisionReview = reviewType === 'revision';

  const { data: initialCourse, isPending: initialPending } = useCourseReviewDetail(
    courseId,
    authReady && !isRevisionReview,
  );
  const { data: revisionCourse, isPending: revisionCoursePending } = useCourseDetail(
    courseId,
    authReady && isRevisionReview,
  );
  const { data: compare, isPending: comparePending } = useCourseRevisionCompare(
    courseId,
    authReady && isRevisionReview,
  );
  const { data: history = [] } = useCourseReviewHistory(courseId, authReady);

  const approveMutation = useApproveCourseReview();
  const requestChangesMutation = useRequestCourseChanges();
  const approveRevisionMutation = useApproveCourseRevision();
  const requestRevisionChangesMutation = useRequestCourseRevisionChanges();
  const publishMutation = usePublishCourse();

  const course = isRevisionReview ? revisionCourse : initialCourse;
  const isPending = isRevisionReview
    ? revisionCoursePending || comparePending
    : initialPending;

  const canDecideInitial = course?.status === CourseLifecycleStatus.UNDER_REVIEW;
  const canDecideRevision =
    isRevisionReview &&
    course?.revisionStatus === CourseRevisionStatus.UNDER_REVIEW;
  const canPublish = course?.status === CourseLifecycleStatus.APPROVED;

  const revisionHistory = history.filter((record: CourseReviewRecord) =>
    [
      CourseReviewDecision.REVISION_SUBMITTED,
      CourseReviewDecision.REVISION_RESUBMITTED,
      CourseReviewDecision.REVISION_APPROVED,
      CourseReviewDecision.REVISION_CHANGES_REQUESTED,
    ].includes(record.decision),
  );
  const displayHistory = isRevisionReview ? revisionHistory : history;

  if (!authReady || isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Course not found or you do not have access.
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={REVIEW_ROLES}>
      <div className="space-y-6">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/dashboard/course-reviews" className="hover:text-foreground">
            Course Reviews
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">
            {isRevisionReview ? 'Revision review' : course.title}
          </span>
        </nav>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
              <Badge
                variant="outline"
                className={cn('text-[11px]', getCourseStatusClassName(course.status))}
              >
                {getCourseLifecycleLabel(course.status)}
              </Badge>
              {isRevisionReview && course.revisionStatus ? (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[11px]',
                    getRevisionBadgeClassName(course.revisionStatus),
                  )}
                >
                  {COURSE_REVISION_LABELS[course.revisionStatus as CourseRevisionStatus]}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Owner: {course.owner?.name ?? course.owner?.email ?? '—'} ·{' '}
              {course.institution?.name ?? '—'}
            </p>
            <p className="text-sm text-muted-foreground">
              Submitted: {formatDate(course.submittedForReviewAt as string | null)}
            </p>
            {isRevisionReview ? (
              <p className="text-sm text-muted-foreground">
                The live course remains available to learners until this revision is approved.
              </p>
            ) : null}
          </div>

          <DashboardActionGroup>
            {canDecideInitial ? (
              <>
                <Button
                  size="sm"
                  className="h-8 bg-success px-3 text-xs text-white hover:bg-success/90"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(course.id)}
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Approve
                </Button>
                <DashboardActionIconButton
                  label="Request changes"
                  icon={MessageSquare}
                  onClick={() => setRequestChangesOpen(true)}
                />
              </>
            ) : null}

            {canDecideRevision ? (
              <>
                <DashboardActionIconButton
                  label="Open builder"
                  icon={ExternalLink}
                  variant="primary"
                  href={`/builder/course/${course.slug}`}
                />
                <Button
                  size="sm"
                  className="h-8 bg-success px-3 text-xs text-white hover:bg-success/90"
                  disabled={approveRevisionMutation.isPending}
                  onClick={() => approveRevisionMutation.mutate(course.id)}
                >
                  {approveRevisionMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Approve revision
                </Button>
                <DashboardActionIconButton
                  label="Request changes"
                  icon={MessageSquare}
                  onClick={() => setRequestChangesOpen(true)}
                />
              </>
            ) : null}

            {canPublish ? (
              <Button
                size="sm"
                className="h-8 bg-success px-3 text-xs text-white hover:bg-success/90"
                disabled={publishMutation.isPending}
                onClick={() => publishMutation.mutate(course.id)}
              >
                {publishMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : null}
                Publish course
              </Button>
            ) : null}
          </DashboardActionGroup>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            {isRevisionReview && compare?.comparison ? (
              <section className="space-y-4 rounded-lg border border-border/80 bg-card p-5">
                <h2 className="text-sm font-semibold">Revision comparison</h2>
                <p className="text-sm text-muted-foreground">
                  Summary of differences between the live version and the pending revision.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <ComparisonList
                    title="Metadata changed"
                    items={compare.comparison.metadataChanged}
                    emptyLabel="No metadata changes."
                  />
                  <ComparisonList
                    title="Modules added"
                    items={compare.comparison.modulesAdded}
                    emptyLabel="No modules added."
                  />
                  <ComparisonList
                    title="Modules removed"
                    items={compare.comparison.modulesRemoved}
                    emptyLabel="No modules removed."
                  />
                  <ComparisonList
                    title="Modules changed"
                    items={compare.comparison.modulesChanged}
                    emptyLabel="No module structure changes."
                  />
                  <ComparisonList
                    title="Lessons changed"
                    items={compare.comparison.lessonsChanged}
                    emptyLabel="No lesson changes."
                  />
                </div>
              </section>
            ) : null}

            <section className="rounded-lg border border-border/80 bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold">Course details</h2>
              {course.shortDescription ? (
                <p className="mb-3 text-sm text-muted-foreground">{course.shortDescription}</p>
              ) : null}
              {course.description ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No detailed description.</p>
              )}
            </section>

            {!isRevisionReview ? (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold">Course preview</h2>
                {(course as CourseReviewDetail).modules?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No modules added yet.</p>
                ) : (
                  ((course as CourseReviewDetail).modules ?? []).map(
                    (module: NonNullable<CourseReviewDetail['modules']>[number]) => (
                      <div
                        key={module.id}
                        className="rounded-lg border border-border/80 bg-card p-4"
                      >
                        <h3 className="font-medium">{module.title}</h3>
                        {module.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {module.description}
                          </p>
                        ) : null}
                        <ul className="mt-3 space-y-2">
                          {module.moduleContents.map(
                            (entry: (typeof module.moduleContents)[number]) => (
                              <li
                                key={entry.id}
                                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm"
                              >
                                <span>{entry.content.title}</span>
                                <Badge variant="secondary" className="text-[10px]">
                                  {contentTypeLabel(entry.content.type)}
                                </Badge>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    ),
                  )
                )}
              </section>
            ) : (
              <section className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-5">
                <p className="text-sm text-muted-foreground">
                  Open the course builder to preview the full pending revision content side by
                  side with review tools.
                </p>
                <DashboardActionIconButton
                  label="Open course builder"
                  icon={ExternalLink}
                  variant="primary"
                  className="mt-3"
                  href={`/builder/course/${course.slug}`}
                />
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-border/80 bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">
                {isRevisionReview ? 'Revision history' : 'Review history'}
              </h2>
              {displayHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No review activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {displayHistory.map((record: CourseReviewRecord) => (
                    <li key={record.id} className="rounded-md border border-border/60 p-3">
                      <p className="text-sm font-medium">{decisionLabel(record.decision)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
                      {record.reviewer ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reviewer: {record.reviewer.name ?? record.reviewer.email}
                        </p>
                      ) : null}
                      {record.submittedBy ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Submitted by: {record.submittedBy.name ?? record.submittedBy.email}
                        </p>
                      ) : null}
                      {record.comments.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {record.comments.map(
                            (comment: CourseReviewRecord['comments'][number]) => (
                              <li key={comment.id} className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{comment.title}</span>
                                {comment.location ? ` · ${comment.location}` : ''}
                              </li>
                            ),
                          )}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>

      <RequestChangesModal
        open={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
        isSubmitting={
          isRevisionReview
            ? requestRevisionChangesMutation.isPending
            : requestChangesMutation.isPending
        }
        onSubmit={(comments) => {
          if (isRevisionReview) {
            requestRevisionChangesMutation.mutate(
              { courseId: course.id, comments },
              { onSuccess: () => setRequestChangesOpen(false) },
            );
            return;
          }

          requestChangesMutation.mutate(
            { courseId: course.id, comments },
            { onSuccess: () => setRequestChangesOpen(false) },
          );
        }}
      />
    </RoleGuard>
  );
}
