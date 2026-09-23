'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  FileEdit,
  FileText,
  Film,
  Layers,
  Loader2,
  MessageSquare,
  PlayCircle,
  RotateCcw,
  Send,
  User,
  Video,
  XCircle,
} from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { getCourseLevelLabel } from '@/lib/course-utils';
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

function getCourseInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function contentTypeMeta(type: string) {
  switch (type) {
    case 'VIDEO':
      return {
        Icon: Video,
        iconClass: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        label: 'Video',
      };
    case 'DOCUMENT':
      return {
        Icon: Film,
        iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'Document',
      };
    case 'QUIZ':
      return {
        Icon: CheckCircle2,
        iconClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        label: 'Quiz',
      };
    case 'ASSIGNMENT':
      return {
        Icon: FileEdit,
        iconClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        label: 'Assignment',
      };
    case 'EXAM':
      return {
        Icon: ClipboardList,
        iconClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        label: 'Exam',
      };
    default:
      return {
        Icon: FileText,
        iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        label: 'Lesson',
      };
  }
}

function decisionMeta(decision: CourseReviewDecision) {
  switch (decision) {
    case CourseReviewDecision.APPROVED:
    case CourseReviewDecision.REVISION_APPROVED:
      return {
        label:
          decision === CourseReviewDecision.REVISION_APPROVED
            ? 'Revision approved'
            : 'Approved',
        Icon: CheckCircle2,
        dotClass: 'bg-emerald-500',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
        badgeClass:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      };
    case CourseReviewDecision.CHANGES_REQUESTED:
    case CourseReviewDecision.REVISION_CHANGES_REQUESTED:
      return {
        label:
          decision === CourseReviewDecision.REVISION_CHANGES_REQUESTED
            ? 'Revision changes requested'
            : 'Changes requested',
        Icon: MessageSquare,
        dotClass: 'bg-orange-500',
        iconClass: 'text-orange-600 dark:text-orange-400',
        badgeClass:
          'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
      };
    case CourseReviewDecision.RESUBMITTED:
    case CourseReviewDecision.REVISION_RESUBMITTED:
      return {
        label:
          decision === CourseReviewDecision.REVISION_RESUBMITTED
            ? 'Revision resubmitted'
            : 'Resubmitted',
        Icon: RotateCcw,
        dotClass: 'bg-blue-500',
        iconClass: 'text-blue-600 dark:text-blue-400',
        badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
      };
    case CourseReviewDecision.REVISION_SUBMITTED:
      return {
        label: 'Revision submitted',
        Icon: Send,
        dotClass: 'bg-indigo-500',
        iconClass: 'text-indigo-600 dark:text-indigo-400',
        badgeClass:
          'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      };
    default:
      return {
        label: 'Submitted for review',
        Icon: Send,
        dotClass: 'bg-primary',
        iconClass: 'text-primary',
        badgeClass: getCourseStatusClassName(CourseLifecycleStatus.UNDER_REVIEW),
      };
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof BookOpen;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  items,
  emptyLabel,
  tone = 'neutral',
}: {
  title: string;
  items: string[];
  emptyLabel: string;
  tone?: 'neutral' | 'added' | 'removed' | 'changed';
}) {
  const toneClass =
    tone === 'added'
      ? 'border-emerald-500/20 bg-emerald-500/5'
      : tone === 'removed'
        ? 'border-red-500/20 bg-red-500/5'
        : tone === 'changed'
          ? 'border-amber-500/20 bg-amber-500/5'
          : 'border-border/60 bg-muted/20';

  return (
    <div className={cn('rounded-xl border p-4', toneClass)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-foreground before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-current before:opacity-40"
            >
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewHistoryTimeline({ records }: { records: CourseReviewRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-10 text-center">
        <Clock className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">No review activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Decisions and feedback will appear here.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {records.map((record, index) => {
        const meta = decisionMeta(record.decision);
        const Icon = meta.Icon;
        const isLast = index === records.length - 1;

        return (
          <li key={record.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card',
                meta.dotClass,
              )}
            >
              <Icon className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="min-w-0 flex-1 space-y-2 rounded-xl border border-border/60 bg-muted/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                <Badge variant="outline" className={cn('text-[10px]', meta.badgeClass)}>
                  {formatDate(record.createdAt)}
                </Badge>
              </div>
              {record.reviewer ? (
                <p className="text-xs text-muted-foreground">
                  Reviewer:{' '}
                  <span className="font-medium text-foreground">
                    {record.reviewer.name ?? record.reviewer.email}
                  </span>
                </p>
              ) : null}
              {record.submittedBy ? (
                <p className="text-xs text-muted-foreground">
                  Submitted by:{' '}
                  <span className="font-medium text-foreground">
                    {record.submittedBy.name ?? record.submittedBy.email}
                  </span>
                </p>
              ) : null}
              {record.comments.length > 0 ? (
                <div className="space-y-2 border-t border-border/60 pt-3">
                  {record.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-border/50 bg-background/80 px-3 py-2"
                    >
                      <p className="text-xs font-medium text-foreground">{comment.title}</p>
                      {comment.location ? (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {comment.location}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {comment.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CoursePreviewSection({ course }: { course: CourseReviewDetail }) {
  const modules = course.modules ?? [];

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-12 text-center">
        <Layers className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">No modules added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module, moduleIndex) => (
        <div
          key={module.id}
          className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm"
        >
          <div className="flex items-start gap-3 border-b border-border/60 bg-muted/20 px-4 py-3.5 sm:px-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {moduleIndex + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">{module.title}</h3>
              {module.description ? (
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                  {module.description}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {module.moduleContents.length}{' '}
                {module.moduleContents.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <ul className="divide-y divide-border/50">
            {module.moduleContents.map((entry, contentIndex) => {
              const meta = contentTypeMeta(entry.content.type);
              const ContentIcon = meta.Icon;

              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:px-5"
                >
                  <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
                    {contentIndex + 1}
                  </span>
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      meta.iconClass,
                    )}
                  >
                    <ContentIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {entry.content.title}
                    </p>
                    {entry.content.description ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.content.description}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px] font-medium">
                    {meta.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
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
    isRevisionReview && course?.revisionStatus === CourseRevisionStatus.UNDER_REVIEW;
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

  const previewStats = useMemo(() => {
    const modules = (course as CourseReviewDetail | undefined)?.modules ?? [];
    const lessonCount = modules.reduce(
      (total, module) => total + module.moduleContents.length,
      0,
    );
    return { moduleCount: modules.length, lessonCount };
  }, [course]);

  if (!authReady || isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <XCircle className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">Course not found or you do not have access.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/course-reviews">Back to reviews</Link>
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={REVIEW_ROLES}>
      <div className="space-y-6 pb-8">
        <DashboardActionIconButton
          label="Back to course reviews"
          icon={ArrowLeft}
          className="-ml-2"
          href="/dashboard/course-reviews"
        />

        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/dashboard/course-reviews" className="transition-colors hover:text-foreground">
            Course Reviews
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">
            {isRevisionReview ? 'Revision review' : course.title}
          </span>
        </nav>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="relative border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-background px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 gap-4">
                {course.thumbnail ? (
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-border/60 shadow-sm sm:h-24 sm:w-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-lg font-bold text-primary sm:h-24 sm:w-24">
                    {getCourseInitials(course.title) || <BookOpen className="h-8 w-8" />}
                  </div>
                )}

                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {course.title}
                    </h1>
                    <Badge
                      variant="outline"
                      className={cn('text-[11px] font-medium', getCourseStatusClassName(course.status))}
                    >
                      {getCourseLifecycleLabel(course.status)}
                    </Badge>
                    {isRevisionReview && course.revisionStatus ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[11px] font-medium',
                          getRevisionBadgeClassName(course.revisionStatus),
                        )}
                      >
                        {COURSE_REVISION_LABELS[course.revisionStatus as CourseRevisionStatus]}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      {course.owner?.name ?? course.owner?.email ?? '—'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {course.institution?.name ?? '—'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      Submitted {formatDate(course.submittedForReviewAt as string | null)}
                    </span>
                  </div>

                  {isRevisionReview ? (
                    <p className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-800 dark:text-blue-300">
                      The live course remains available to learners until this revision is approved.
                    </p>
                  ) : null}
                </div>
              </div>

              <DashboardActionGroup className="shrink-0">
                {canDecideInitial ? (
                  <>
                    <Button
                      size="sm"
                      className="h-9 bg-success px-4 text-sm font-medium text-white shadow-sm hover:bg-success/90"
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(course.id)}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-2"
                      onClick={() => setRequestChangesOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Request changes
                    </Button>
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
                      className="h-9 bg-success px-4 text-sm font-medium text-white shadow-sm hover:bg-success/90"
                      disabled={approveRevisionMutation.isPending}
                      onClick={() => approveRevisionMutation.mutate(course.id)}
                    >
                      {approveRevisionMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Approve revision
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-2"
                      onClick={() => setRequestChangesOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Request changes
                    </Button>
                  </>
                ) : null}

                {canPublish ? (
                  <Button
                    size="sm"
                    className="h-9 bg-success px-4 text-sm font-medium text-white shadow-sm hover:bg-success/90"
                    disabled={publishMutation.isPending}
                    onClick={() => publishMutation.mutate(course.id)}
                  >
                    {publishMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    )}
                    Publish course
                  </Button>
                ) : null}
              </DashboardActionGroup>
            </div>
          </div>

          {!isRevisionReview ? (
            <div className="grid gap-3 border-b border-border/60 bg-muted/10 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
              <StatCard label="Modules" value={previewStats.moduleCount} icon={Layers} />
              <StatCard label="Lessons" value={previewStats.lessonCount} icon={BookOpen} />
              <StatCard
                label="Level"
                value={getCourseLevelLabel(course.level) ?? '—'}
                icon={ClipboardList}
              />
              <StatCard
                label="Est. hours"
                value={course.estimatedHours ?? '—'}
                icon={Clock}
              />
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            {isRevisionReview && compare?.comparison ? (
              <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Revision comparison</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Summary of differences between the live version and the pending revision.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ComparisonCard
                    title="Metadata changed"
                    items={compare.comparison.metadataChanged}
                    emptyLabel="No metadata changes."
                    tone="changed"
                  />
                  <ComparisonCard
                    title="Modules added"
                    items={compare.comparison.modulesAdded}
                    emptyLabel="No modules added."
                    tone="added"
                  />
                  <ComparisonCard
                    title="Modules removed"
                    items={compare.comparison.modulesRemoved}
                    emptyLabel="No modules removed."
                    tone="removed"
                  />
                  <ComparisonCard
                    title="Modules changed"
                    items={compare.comparison.modulesChanged}
                    emptyLabel="No module structure changes."
                    tone="changed"
                  />
                  <ComparisonCard
                    title="Lessons changed"
                    items={compare.comparison.lessonsChanged}
                    emptyLabel="No lesson changes."
                    tone="changed"
                  />
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">Course details</h2>
              <Separator className="my-4" />
              {course.shortDescription ? (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {course.shortDescription}
                </p>
              ) : null}
              {course.description ? (
                <div
                  className="prose prose-sm max-w-none rounded-xl border border-border/50 bg-muted/10 p-4 dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  No detailed description provided.
                </div>
              )}
            </section>

            {!isRevisionReview ? (
              <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Course preview</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Structure and content submitted for review
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    {previewStats.moduleCount}{' '}
                    {previewStats.moduleCount === 1 ? 'module' : 'modules'}
                  </Badge>
                </div>
                <CoursePreviewSection course={course as CourseReviewDetail} />
              </section>
            ) : (
              <section className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
                <ExternalLink className="mx-auto mb-3 h-8 w-8 text-primary/70" />
                <h2 className="text-lg font-semibold text-foreground">Preview in builder</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Open the course builder to preview the full pending revision content side by
                  side with review tools.
                </p>
                <Button variant="default" size="sm" className="mt-4" asChild>
                  <Link href={`/builder/course/${course.slug}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open course builder
                  </Link>
                </Button>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="sticky top-6 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                {isRevisionReview ? 'Revision history' : 'Review history'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Timeline of submissions and decisions
              </p>
              <Separator className="my-4" />
              <ReviewHistoryTimeline records={displayHistory} />
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
