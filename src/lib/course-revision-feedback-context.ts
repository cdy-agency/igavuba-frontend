import { CourseLifecycleStatus } from '@/types/course-status';
import { CourseRevisionStatus } from '@/types/course-revision';
import type { CourseReviewComment } from '@/types/course-review';
import { UserRole } from '@/types/enum';
import type {
  CourseReviewFeedbackBadgeTone,
  CourseReviewFeedbackContext,
  CourseReviewFeedbackMode,
} from '@/lib/course-review-feedback-context';

interface GetCourseRevisionFeedbackContextParams {
  status: CourseLifecycleStatus;
  revisionStatus?: CourseRevisionStatus | null;
  hasUnpublishedChanges?: boolean;
  isOwner: boolean;
  role: UserRole | null;
  comments: CourseReviewComment[];
}

export function getCourseRevisionFeedbackContext(
  params: GetCourseRevisionFeedbackContextParams,
): CourseReviewFeedbackContext | null {
  const {
    status,
    revisionStatus,
    hasUnpublishedChanges,
    isOwner,
    role,
    comments,
  } = params;

  if (
    status !== CourseLifecycleStatus.PUBLISHED ||
    !hasUnpublishedChanges ||
    !revisionStatus
  ) {
    return null;
  }

  const isInstitutionAdmin =
    role === UserRole.INSTITUTION_ADMIN || role === UserRole.SUPER_ADMIN;
  const unresolvedCount = comments.filter((comment) => !comment.resolvedAt).length;
  const lecturerReplyCount = comments.filter(
    (comment) => comment.resolvedAt && comment.ownerResponse,
  ).length;

  if (revisionStatus === CourseRevisionStatus.CHANGES_REQUESTED && isOwner) {
    return {
      mode: 'lecturer-reply' as CourseReviewFeedbackMode,
      showFeedbackButton: true,
      feedbackLabel: 'Reply needed',
      badgeCount: unresolvedCount > 0 ? unresolvedCount : null,
      badgeTone: 'action' as CourseReviewFeedbackBadgeTone,
      showResubmit: true,
      canReply: true,
      autoOpenSheet: unresolvedCount > 0,
      sheetDescription: 'Reply to each admin note on your revision, then resubmit.',
    };
  }

  if (revisionStatus === CourseRevisionStatus.CHANGES_REQUESTED && isInstitutionAdmin) {
    return {
      mode: 'admin-awaiting',
      showFeedbackButton: true,
      feedbackLabel: 'Awaiting lecturer',
      badgeCount: unresolvedCount > 0 ? unresolvedCount : null,
      badgeTone: 'waiting',
      showResubmit: false,
      canReply: false,
      autoOpenSheet: false,
      sheetDescription: 'Revision feedback you sent — waiting for the lecturer to respond.',
    };
  }

  if (
    revisionStatus === CourseRevisionStatus.UNDER_REVIEW &&
    isInstitutionAdmin &&
    lecturerReplyCount > 0
  ) {
    return {
      mode: 'admin-review-replies',
      showFeedbackButton: true,
      feedbackLabel: 'Lecturer replies',
      badgeCount: lecturerReplyCount,
      badgeTone: 'new',
      showResubmit: false,
      canReply: false,
      autoOpenSheet: false,
      sheetDescription: 'Review lecturer responses on this revision before deciding.',
    };
  }

  return null;
}

export function getRevisionBadgeLabel(
  revisionStatus: CourseRevisionStatus | null | undefined,
): string | null {
  if (!revisionStatus) return null;
  switch (revisionStatus) {
    case CourseRevisionStatus.DRAFT:
      return 'Draft revision';
    case CourseRevisionStatus.UNDER_REVIEW:
      return 'Pending review';
    case CourseRevisionStatus.CHANGES_REQUESTED:
      return 'Changes requested';
    default:
      return null;
  }
}

export function getRevisionBadgeClassName(
  revisionStatus: CourseRevisionStatus | null | undefined,
): string {
  switch (revisionStatus) {
    case CourseRevisionStatus.DRAFT:
      return 'border-violet-500/30 bg-violet-500/5 text-violet-800';
    case CourseRevisionStatus.UNDER_REVIEW:
      return 'border-blue-500/30 bg-blue-500/5 text-blue-800';
    case CourseRevisionStatus.CHANGES_REQUESTED:
      return 'border-orange-500/30 bg-orange-500/5 text-orange-800';
    default:
      return '';
  }
}
