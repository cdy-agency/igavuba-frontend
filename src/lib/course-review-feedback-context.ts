import { CourseLifecycleStatus } from '@/types/course-status';
import type { CourseReviewComment } from '@/types/course-review';
import { UserRole } from '@/types/enum';

export type CourseReviewFeedbackMode =
  | 'lecturer-reply'
  | 'admin-awaiting'
  | 'admin-review-replies'
  | 'hidden';

export type CourseReviewFeedbackBadgeTone = 'action' | 'waiting' | 'new';

export interface CourseReviewFeedbackContext {
  mode: CourseReviewFeedbackMode;
  showFeedbackButton: boolean;
  feedbackLabel: string;
  badgeCount: number | null;
  badgeTone: CourseReviewFeedbackBadgeTone;
  showResubmit: boolean;
  canReply: boolean;
  autoOpenSheet: boolean;
  sheetDescription: string;
}

interface GetCourseReviewFeedbackContextParams {
  status: CourseLifecycleStatus;
  isOwner: boolean;
  role: UserRole | null;
  comments: CourseReviewComment[];
}

export function getCourseReviewFeedbackContext({
  status,
  isOwner,
  role,
  comments,
}: GetCourseReviewFeedbackContextParams): CourseReviewFeedbackContext {
  const isInstitutionAdmin =
    role === UserRole.INSTITUTION_ADMIN || role === UserRole.SUPER_ADMIN;
  const unresolvedCount = comments.filter((comment) => !comment.resolvedAt).length;
  const lecturerReplyCount = comments.filter(
    (comment) => comment.resolvedAt && comment.ownerResponse,
  ).length;

  if (status === CourseLifecycleStatus.CHANGES_REQUESTED && isOwner) {
    return {
      mode: 'lecturer-reply',
      showFeedbackButton: true,
      feedbackLabel: 'Reply needed',
      badgeCount: unresolvedCount > 0 ? unresolvedCount : null,
      badgeTone: 'action',
      showResubmit: true,
      canReply: true,
      autoOpenSheet: unresolvedCount > 0,
      sheetDescription: 'Reply to each admin note, then resubmit for approval.',
    };
  }

  if (status === CourseLifecycleStatus.CHANGES_REQUESTED && isInstitutionAdmin) {
    return {
      mode: 'admin-awaiting',
      showFeedbackButton: true,
      feedbackLabel: 'Awaiting lecturer',
      badgeCount: unresolvedCount > 0 ? unresolvedCount : null,
      badgeTone: 'waiting',
      showResubmit: false,
      canReply: false,
      autoOpenSheet: false,
      sheetDescription: 'Feedback you sent — waiting for the lecturer to respond.',
    };
  }

  if (
    status === CourseLifecycleStatus.UNDER_REVIEW &&
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
      sheetDescription: 'Review the lecturer responses before approving or requesting more changes.',
    };
  }

  return {
    mode: 'hidden',
    showFeedbackButton: false,
    feedbackLabel: '',
    badgeCount: null,
    badgeTone: 'action',
    showResubmit: false,
    canReply: false,
    autoOpenSheet: false,
    sheetDescription: '',
  };
}
