'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { getCourseStatusClassName } from '@/lib/course-utils';
import type { CourseReviewFeedbackBadgeTone } from '@/lib/course-review-feedback-context';
import { CourseLifecycleStatus } from '@/types/course-status';
import { CourseRevisionStatus } from '@/types/course-revision';
import type { Course } from '@/types/course';
import {
  getRevisionBadgeClassName,
  getRevisionBadgeLabel,
} from '@/lib/course-revision-feedback-context';
import { cn } from '@/lib/utils';

interface BuilderHeaderProps {
  course: Course;
  isSaving?: boolean;
  isActionPending?: boolean;
  readOnly?: boolean;
  canPublish?: boolean;
  canPublishDirectly?: boolean;
  requireCourseApproval?: boolean;
  canReviewAsAdmin?: boolean;
  canReviewRevisionAsAdmin?: boolean;
  onSubmitForReview?: () => void;
  onResubmit?: () => void;
  onSubmitRevision?: () => void;
  onResubmitRevision?: () => void;
  canResubmit?: boolean;
  onPublish?: () => void;
  onApprove?: () => void;
  onApproveRevision?: () => void;
  onRequestChanges?: () => void;
  onRequestRevisionChanges?: () => void;
  onOpenReviewFeedback?: () => void;
  showFeedbackButton?: boolean;
  feedbackLabel?: string;
  feedbackBadgeCount?: number | null;
  feedbackBadgeTone?: CourseReviewFeedbackBadgeTone;
  showResubmit?: boolean;
}

export function BuilderHeader({
  course,
  isSaving,
  isActionPending,
  readOnly = false,
  canPublish = false,
  canPublishDirectly = false,
  requireCourseApproval = true,
  canReviewAsAdmin = false,
  canReviewRevisionAsAdmin = false,
  onSubmitForReview,
  onResubmit,
  onSubmitRevision,
  onResubmitRevision,
  canResubmit = true,
  onPublish,
  onApprove,
  onApproveRevision,
  onRequestChanges,
  onRequestRevisionChanges,
  onOpenReviewFeedback,
  showFeedbackButton = false,
  feedbackLabel = 'Feedback',
  feedbackBadgeCount = null,
  feedbackBadgeTone = 'action',
  showResubmit = false,
}: BuilderHeaderProps) {
  const statusLabel = getCourseLifecycleLabel(course.status).toUpperCase();

  const feedbackButtonClasses = {
    action:
      'border-orange-500/30 bg-orange-500/5 text-orange-800 hover:bg-orange-500/10',
    waiting:
      'border-blue-500/30 bg-blue-500/5 text-blue-800 hover:bg-blue-500/10',
    new: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 hover:bg-emerald-500/10',
  } as const;

  const feedbackBadgeClasses = {
    action: 'bg-orange-500 text-white',
    waiting: 'bg-blue-500 text-white',
    new: 'bg-emerald-600 text-white',
  } as const;

  const renderPrimaryAction = () => {
    if (
      course.status === CourseLifecycleStatus.DRAFT &&
      !requireCourseApproval &&
      canPublishDirectly
    ) {
      return (
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 bg-success px-3 text-[12px] font-semibold text-white hover:bg-success/90"
          disabled={isActionPending}
          onClick={onPublish}
        >
          {isActionPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Publish
        </Button>
      );
    }

    if (course.status === CourseLifecycleStatus.DRAFT && requireCourseApproval) {
      return (
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 bg-primary px-3 text-[12px] font-semibold text-white"
          disabled={isActionPending}
          onClick={onSubmitForReview}
        >
          {isActionPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Submit for review
        </Button>
      );
    }

    if (
      course.status === CourseLifecycleStatus.CHANGES_REQUESTED &&
      !requireCourseApproval &&
      canPublishDirectly
    ) {
      return (
        <>
          {showFeedbackButton ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                'relative h-8 gap-1.5 px-3 text-[12px] font-semibold',
                feedbackButtonClasses[feedbackBadgeTone],
              )}
              onClick={onOpenReviewFeedback}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {feedbackLabel}
              {feedbackBadgeCount !== null && feedbackBadgeCount > 0 ? (
                <span
                  className={cn(
                    'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    feedbackBadgeClasses[feedbackBadgeTone],
                  )}
                >
                  {feedbackBadgeCount}
                </span>
              ) : null}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 bg-success px-3 text-[12px] font-semibold text-white hover:bg-success/90"
            disabled={isActionPending}
            onClick={onPublish}
          >
            {isActionPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Publish
          </Button>
        </>
      );
    }

    if (course.status === CourseLifecycleStatus.CHANGES_REQUESTED) {
      return (
        <>
          {showFeedbackButton ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                'relative h-8 gap-1.5 px-3 text-[12px] font-semibold',
                feedbackButtonClasses[feedbackBadgeTone],
              )}
              onClick={onOpenReviewFeedback}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {feedbackLabel}
              {feedbackBadgeCount !== null && feedbackBadgeCount > 0 ? (
                <span
                  className={cn(
                    'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    feedbackBadgeClasses[feedbackBadgeTone],
                  )}
                >
                  {feedbackBadgeCount}
                </span>
              ) : null}
            </Button>
          ) : null}
          {showResubmit ? (
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 bg-primary px-3 text-[12px] font-semibold text-white"
              disabled={isActionPending || !canResubmit}
              onClick={onResubmit}
              title={
                !canResubmit
                  ? 'Reply to all review feedback before resubmitting'
                  : undefined
              }
            >
              {isActionPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Resubmit
            </Button>
          ) : null}
        </>
      );
    }

    if (course.status === CourseLifecycleStatus.APPROVED && canPublish) {
      return (
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 bg-success px-3 text-[12px] font-semibold text-white hover:bg-success/90"
          disabled={isActionPending}
          onClick={onPublish}
        >
          {isActionPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Publish
        </Button>
      );
    }

    if (course.status === CourseLifecycleStatus.UNDER_REVIEW) {
      if (canReviewAsAdmin) {
        return (
          <>
            {showFeedbackButton ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  'relative h-8 gap-1.5 px-3 text-[12px] font-semibold',
                  feedbackButtonClasses[feedbackBadgeTone],
                )}
                onClick={onOpenReviewFeedback}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {feedbackLabel}
                {feedbackBadgeCount !== null && feedbackBadgeCount > 0 ? (
                  <span
                    className={cn(
                      'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                      feedbackBadgeClasses[feedbackBadgeTone],
                    )}
                  >
                    {feedbackBadgeCount}
                  </span>
                ) : null}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 bg-success px-3 text-[12px] font-semibold text-white hover:bg-success/90"
              disabled={isActionPending}
              onClick={onApprove}
            >
              {isActionPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-3 text-[12px] font-semibold"
              disabled={isActionPending}
              onClick={onRequestChanges}
            >
              Request changes
            </Button>
          </>
        );
      }

      return (
        <Badge variant="outline" className="h-8 px-3 text-[11px] font-semibold">
          Awaiting review
        </Badge>
      );
    }

    if (course.status === CourseLifecycleStatus.PUBLISHED) {
      const revisionStatus = course.revisionStatus;
      const hasRevision = course.hasUnpublishedChanges && revisionStatus;

      if (hasRevision && revisionStatus === CourseRevisionStatus.DRAFT) {
        return (
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 bg-primary px-3 text-[12px] font-semibold text-white"
            disabled={isActionPending}
            onClick={onSubmitRevision}
          >
            {isActionPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {requireCourseApproval ? 'Submit revision' : 'Publish revision'}
          </Button>
        );
      }

      if (
        hasRevision &&
        revisionStatus === CourseRevisionStatus.CHANGES_REQUESTED
      ) {
        return (
          <>
            {showFeedbackButton ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  'relative h-8 gap-1.5 px-3 text-[12px] font-semibold',
                  feedbackButtonClasses[feedbackBadgeTone],
                )}
                onClick={onOpenReviewFeedback}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {feedbackLabel}
                {feedbackBadgeCount !== null && feedbackBadgeCount > 0 ? (
                  <span
                    className={cn(
                      'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                      feedbackBadgeClasses[feedbackBadgeTone],
                    )}
                  >
                    {feedbackBadgeCount}
                  </span>
                ) : null}
              </Button>
            ) : null}
            {showResubmit ? (
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 bg-primary px-3 text-[12px] font-semibold text-white"
                disabled={isActionPending || !canResubmit}
                onClick={onResubmitRevision}
                title={
                  !canResubmit
                    ? 'Reply to all revision feedback before resubmitting'
                    : undefined
                }
              >
                {isActionPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {requireCourseApproval ? 'Resubmit revision' : 'Publish revision'}
              </Button>
            ) : null}
          </>
        );
      }

      if (
        hasRevision &&
        revisionStatus === CourseRevisionStatus.UNDER_REVIEW &&
        canReviewRevisionAsAdmin
      ) {
        return (
          <>
            {showFeedbackButton ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  'relative h-8 gap-1.5 px-3 text-[12px] font-semibold',
                  feedbackButtonClasses[feedbackBadgeTone],
                )}
                onClick={onOpenReviewFeedback}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {feedbackLabel}
                {feedbackBadgeCount !== null && feedbackBadgeCount > 0 ? (
                  <span
                    className={cn(
                      'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                      feedbackBadgeClasses[feedbackBadgeTone],
                    )}
                  >
                    {feedbackBadgeCount}
                  </span>
                ) : null}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 bg-success px-3 text-[12px] font-semibold text-white hover:bg-success/90"
              disabled={isActionPending}
              onClick={onApproveRevision}
            >
              {isActionPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Approve revision
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-3 text-[12px] font-semibold"
              disabled={isActionPending}
              onClick={onRequestRevisionChanges}
            >
              Request changes
            </Button>
          </>
        );
      }

      if (hasRevision && revisionStatus === CourseRevisionStatus.UNDER_REVIEW) {
        return (
          <Badge variant="outline" className="h-8 px-3 text-[11px] font-semibold">
            Revision pending review
          </Badge>
        );
      }

      return (
        <Badge variant="outline" className="h-8 border-success/30 px-3 text-[11px] font-semibold text-success">
          Published
        </Badge>
      );
    }

    return null;
  };

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
        >
          <Link href="/dashboard/courses" aria-label="Back to courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground md:text-base">
              {course.title}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                'h-5 shrink-0 px-2 text-[10px] font-bold uppercase tracking-wide',
                getCourseStatusClassName(course.status),
              )}
            >
              {statusLabel}
            </Badge>
            {course.hasUnpublishedChanges && course.revisionStatus ? (
              <Badge
                variant="outline"
                className={cn(
                  'h-5 shrink-0 px-2 text-[10px] font-bold uppercase tracking-wide',
                  getRevisionBadgeClassName(course.revisionStatus),
                )}
              >
                {getRevisionBadgeLabel(course.revisionStatus)?.toUpperCase()}
              </Badge>
            ) : null}
            {readOnly ? (
              <span className="text-[11px] text-muted-foreground">Read-only</span>
            ) : null}
            {isSaving ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {renderPrimaryAction()}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 border-border/80 px-2.5 text-[12px] font-medium"
            >
              More
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/courses/${course.slug}/results`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View results
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild disabled={readOnly}>
              <Link href={`/dashboard/courses/${course.slug}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit course details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/courses">Back to courses</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
