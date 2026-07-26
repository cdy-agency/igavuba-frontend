'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useCourseDetail, usePublishCourse } from '@/hooks/use-courses';
import {
  useApproveCourseReview,
  useCourseReviewComments,
  useResubmitCourseForReview,
  useRequestCourseChanges,
  useSubmitCourseForReview,
} from '@/hooks/use-course-review';
import {
  useApproveCourseRevision,
  useCourseRevisionComments,
  useRequestCourseRevisionChanges,
  useResubmitCourseRevision,
  useSubmitCourseRevision,
} from '@/hooks/use-course-revision';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Button } from '@/components/ui/button';
import { CourseBuilderProvider } from '@/components/course-builder/course-builder-context';
import { CourseBuilderDeepLink } from '@/components/course-builder/course-builder-deep-link';
import { BuilderHeader } from '@/components/course-builder/builder-header';
import { ModuleSidebar } from '@/components/course-builder/module-sidebar';
import { ContentPanel } from '@/components/course-builder/content-panel';
import { LessonNavFooter } from '@/components/course-builder/lesson-nav-footer';
import { CourseFinalExamPanel } from '@/components/course-builder/course-final-exam-panel';
import { CourseReviewChatSheet } from '@/components/dashboard/course-reviews/course-review-chat-sheet';
import { RequestChangesModal } from '@/components/dashboard/course-reviews/request-changes-modal';
import type { CourseReviewComment } from '@/types/course-review';
import { useCourseBuilder } from '@/components/course-builder/course-builder-context';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useDashboard } from '@/contexts/dashboard-context';
import { getCourseReviewFeedbackContext } from '@/lib/course-review-feedback-context';
import { getCourseRevisionFeedbackContext } from '@/lib/course-revision-feedback-context';
import {
  CourseLifecycleStatus,
  isCourseOwnerEditable,
} from '@/types/course-status';
import { CourseRevisionStatus } from '@/types/course-revision';

const BUILDER_ROLES = [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN, UserRole.LECTURER];

interface CourseBuilderShellProps {
  slug: string;
}

function CourseBuilderShell({ slug }: CourseBuilderShellProps) {
  const authReady = useAuthReady();
  const { role, user } = useDashboard();
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [reviewChatOpen, setReviewChatOpen] = useState(false);
  const { data: course, isPending, isError, error, refetch } = useCourseDetail(slug, authReady);
  const { selectedModuleId, viewingFinalExam, builderSaveState } = useCourseBuilder();
  const publishMutation = usePublishCourse();
  const submitReviewMutation = useSubmitCourseForReview();
  const resubmitMutation = useResubmitCourseForReview();
  const approveMutation = useApproveCourseReview();
  const requestChangesMutation = useRequestCourseChanges();
  const submitRevisionMutation = useSubmitCourseRevision();
  const resubmitRevisionMutation = useResubmitCourseRevision();
  const approveRevisionMutation = useApproveCourseRevision();
  const requestRevisionChangesMutation = useRequestCourseRevisionChanges();

  const isOwner = course ? course.ownerId === user?.id : false;
  const isInstitutionAdmin = role === UserRole.INSTITUTION_ADMIN;
  const isPublishedWithRevision =
    course?.status === CourseLifecycleStatus.PUBLISHED &&
    course.hasUnpublishedChanges &&
    course.revisionStatus;

  const canReviewAsAdmin =
    isInstitutionAdmin && course?.status === CourseLifecycleStatus.UNDER_REVIEW;
  const canReviewRevisionAsAdmin =
    isInstitutionAdmin &&
    isPublishedWithRevision &&
    course?.revisionStatus === CourseRevisionStatus.UNDER_REVIEW;

  const shouldFetchReviewComments =
    course?.status === CourseLifecycleStatus.CHANGES_REQUESTED ||
    (course?.status === CourseLifecycleStatus.UNDER_REVIEW && isInstitutionAdmin);

  const shouldFetchRevisionComments =
    Boolean(isPublishedWithRevision) &&
    (course?.revisionStatus === CourseRevisionStatus.CHANGES_REQUESTED ||
      (course?.revisionStatus === CourseRevisionStatus.UNDER_REVIEW && isInstitutionAdmin));

  const { data: reviewComments } = useCourseReviewComments(
    course?.id ?? '',
    Boolean(course?.id) && shouldFetchReviewComments,
  );

  const { data: revisionComments } = useCourseRevisionComments(
    course?.id ?? '',
    Boolean(course?.id) && shouldFetchRevisionComments,
  );

  const reviewFeedback = reviewComments?.comments ?? [];
  const revisionFeedback = revisionComments?.comments ?? [];
  const activeFeedback = shouldFetchRevisionComments ? revisionFeedback : reviewFeedback;

  const feedbackContext = useMemo(() => {
    if (!course) return null;

    const revisionContext = getCourseRevisionFeedbackContext({
      status: course.status,
      revisionStatus: course.revisionStatus,
      hasUnpublishedChanges: course.hasUnpublishedChanges,
      isOwner,
      role,
      comments: revisionFeedback,
    });

    if (revisionContext) return revisionContext;

    return getCourseReviewFeedbackContext({
      status: course.status,
      isOwner,
      role,
      comments: reviewFeedback,
    });
  }, [course, isOwner, role, reviewFeedback, revisionFeedback]);

  const canResubmit =
    feedbackContext?.showResubmit &&
    activeFeedback.length > 0 &&
    activeFeedback.every((comment: CourseReviewComment) => Boolean(comment.resolvedAt));

  useEffect(() => {
    if (feedbackContext?.autoOpenSheet) {
      setReviewChatOpen(true);
    }
  }, [course?.id, feedbackContext?.autoOpenSheet]);

  const readOnly = course
    ? !isCourseOwnerEditable(course.status, {
        isOwner,
        hasUnpublishedChanges: course.hasUnpublishedChanges,
        revisionStatus: course.revisionStatus,
      }) ||
      canReviewAsAdmin ||
      canReviewRevisionAsAdmin ||
      (isPublishedWithRevision &&
        course.revisionStatus === CourseRevisionStatus.UNDER_REVIEW &&
        isOwner)
    : false;
  const requireCourseApproval =
    course?.institutionSettings?.requireCourseApproval ?? true;
  const canPublishDirectly =
    !requireCourseApproval &&
    (course?.status === CourseLifecycleStatus.DRAFT ||
      course?.status === CourseLifecycleStatus.CHANGES_REQUESTED) &&
    (isOwner || isInstitutionAdmin);
  const canPublish =
    requireCourseApproval
      ? course?.status === CourseLifecycleStatus.APPROVED && (isOwner || isInstitutionAdmin)
      : canPublishDirectly;
  const isActionPending =
    publishMutation.isPending ||
    submitReviewMutation.isPending ||
    resubmitMutation.isPending ||
    approveMutation.isPending ||
    requestChangesMutation.isPending ||
    submitRevisionMutation.isPending ||
    resubmitRevisionMutation.isPending ||
    approveRevisionMutation.isPending ||
    requestRevisionChangesMutation.isPending;

  if (!authReady || isPending) {
    return (
      <div className="course-builder-page flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="course-builder-page flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(error, 'Unable to load course.')}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/courses">Back to courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const ownerName = course.owner?.name || course.owner?.email || 'Lecturer';

  return (
    <div className="course-builder-page">
      <CourseBuilderDeepLink courseId={course.id} />
      <BuilderHeader
        course={course}
        readOnly={readOnly}
        canPublish={canPublish}
        canPublishDirectly={canPublishDirectly}
        requireCourseApproval={requireCourseApproval}
        canReviewAsAdmin={canReviewAsAdmin}
        canReviewRevisionAsAdmin={canReviewRevisionAsAdmin}
        canResubmit={canResubmit}
        isActionPending={isActionPending}
        isSaving={builderSaveState?.isSaving}
        saveStatusMessage={builderSaveState?.message}
        showFeedbackButton={feedbackContext?.showFeedbackButton}
        feedbackLabel={feedbackContext?.feedbackLabel}
        feedbackBadgeCount={feedbackContext?.badgeCount}
        feedbackBadgeTone={feedbackContext?.badgeTone}
        showResubmit={feedbackContext?.showResubmit}
        onSubmitForReview={() =>
          submitReviewMutation.mutate(course.id, { onSuccess: () => refetch() })
        }
        onResubmit={() =>
          resubmitMutation.mutate(course.id, { onSuccess: () => refetch() })
        }
        onPublish={() =>
          publishMutation.mutate(course.id, { onSuccess: () => refetch() })
        }
        onApprove={() =>
          approveMutation.mutate(course.id, { onSuccess: () => refetch() })
        }
        onApproveRevision={() =>
          approveRevisionMutation.mutate(course.id, { onSuccess: () => refetch() })
        }
        onSubmitRevision={() =>
          submitRevisionMutation.mutate(course.id, { onSuccess: () => refetch() })
        }
        onResubmitRevision={() =>
          resubmitRevisionMutation.mutate(course.id, { onSuccess: () => refetch() })
        }
        onRequestChanges={() => setRequestChangesOpen(true)}
        onRequestRevisionChanges={() => setRequestChangesOpen(true)}
        onOpenReviewFeedback={() => setReviewChatOpen(true)}
      />

      {feedbackContext ? (
        <CourseReviewChatSheet
          open={reviewChatOpen}
          onOpenChange={setReviewChatOpen}
          courseId={course.id}
          status={course.status}
          mode={feedbackContext.mode}
          canReply={feedbackContext.canReply}
          showResubmitFooter={feedbackContext.showResubmit}
          sheetDescription={feedbackContext.sheetDescription}
          ownerName={ownerName}
          revisionMode={shouldFetchRevisionComments}
          onResubmitted={() => refetch()}
        />
      ) : null}

      {isOwner &&
      course.status === CourseLifecycleStatus.PUBLISHED &&
      !readOnly ? (
        <div className="shrink-0 border-b border-violet-500/20 bg-violet-500/5 px-4 py-2 text-center text-xs text-violet-900 md:px-6">
          {course.hasUnpublishedChanges
            ? requireCourseApproval
              ? 'You are editing a draft revision. Learners still see the published version until this revision is submitted and approved.'
              : 'You are editing a draft revision. Learners still see the published version until you publish this revision.'
            : requireCourseApproval
              ? 'Edits on this published course are saved as a draft revision. Learners will not see changes until you submit and an admin approves.'
              : 'Edits on this published course are saved as a draft revision. Learners will not see changes until you publish the revision.'}
        </div>
      ) : null}

      {readOnly &&
      isPublishedWithRevision &&
      course.revisionStatus === CourseRevisionStatus.UNDER_REVIEW ? (
        <div className="shrink-0 border-b border-blue-500/20 bg-blue-500/5 px-4 py-2 text-center text-xs text-blue-800 md:px-6">
          {canReviewRevisionAsAdmin
            ? 'Revision review mode — compare changes below, then approve or request changes. The live course remains available to learners.'
            : 'Your revision is under review. Editing is locked until the institution admin completes the review.'}
        </div>
      ) : null}

      {readOnly && course.status === CourseLifecycleStatus.UNDER_REVIEW ? (
        <div className="shrink-0 border-b border-blue-500/20 bg-blue-500/5 px-4 py-2 text-center text-xs text-blue-800 md:px-6">
          {canReviewAsAdmin
            ? 'Review mode — preview the course content below, then approve or request changes.'
            : 'This course is under review. Editing is locked until the institution admin completes the review.'}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="course-builder-body min-h-0 flex-1">
          <ModuleSidebar
            courseId={course.id}
            courseSlug={course.slug}
            courseStatus={course.status}
            readOnly={readOnly}
            onFinalExamChanged={() => refetch()}
          />

          <div className="course-builder-main">
            <div className="course-builder-content-scroll custom-scrollbar custom-scrollbar-muted px-4 py-6 md:px-8 md:py-8">
              {viewingFinalExam ? (
                <CourseFinalExamPanel
                  courseId={course.id}
                  courseSlug={course.slug}
                  courseStatus={course.status}
                  hasUnpublishedChanges={course.hasUnpublishedChanges}
                  revisionStatus={course.revisionStatus}
                  readOnly={readOnly}
                  canResubmit={canResubmit}
                  isSubmittingRevision={submitRevisionMutation.isPending || resubmitRevisionMutation.isPending}
                  onSubmitRevision={() =>
                    submitRevisionMutation.mutate(course.id, { onSuccess: () => refetch() })
                  }
                  onResubmitRevision={() =>
                    resubmitRevisionMutation.mutate(course.id, { onSuccess: () => refetch() })
                  }
                  onFinalExamChanged={() => refetch()}
                />
              ) : (
                <ContentPanel moduleId={selectedModuleId} courseSlug={course.slug} readOnly={readOnly} />
              )}
            </div>
            <LessonNavFooter courseId={course.id} />
          </div>
        </div>
      </div>

      <RequestChangesModal
        open={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
        isSubmitting={
          shouldFetchRevisionComments
            ? requestRevisionChangesMutation.isPending
            : requestChangesMutation.isPending
        }
        onSubmit={(comments) => {
          if (shouldFetchRevisionComments) {
            requestRevisionChangesMutation.mutate(
              { courseId: course.id, comments },
              {
                onSuccess: () => {
                  setRequestChangesOpen(false);
                  refetch();
                },
              },
            );
            return;
          }

          requestChangesMutation.mutate(
            { courseId: course.id, comments },
            {
              onSuccess: () => {
                setRequestChangesOpen(false);
                refetch();
              },
            },
          );
        }}
      />
    </div>
  );
}

export function CourseBuilderPage({ slug }: CourseBuilderShellProps) {
  return (
    <RoleGuard allowedRoles={BUILDER_ROLES}>
      <CourseBuilderProvider>
        <Suspense
          fallback={
            <div className="course-builder-page flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <CourseBuilderShell slug={slug} />
        </Suspense>
      </CourseBuilderProvider>
    </RoleGuard>
  );
}
