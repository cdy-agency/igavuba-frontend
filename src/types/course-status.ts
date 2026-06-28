import { CourseRevisionStatus } from './course-revision';

/** Matches backend Prisma CourseStatus lifecycle values. */
export enum CourseLifecycleStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export const COURSE_LIFECYCLE_LABELS: Record<CourseLifecycleStatus, string> = {
  [CourseLifecycleStatus.DRAFT]: 'Draft',
  [CourseLifecycleStatus.UNDER_REVIEW]: 'Under review',
  [CourseLifecycleStatus.CHANGES_REQUESTED]: 'Changes requested',
  [CourseLifecycleStatus.APPROVED]: 'Approved',
  [CourseLifecycleStatus.PUBLISHED]: 'Published',
  [CourseLifecycleStatus.ARCHIVED]: 'Archived',
};

export const OWNER_EDITABLE_STATUSES: CourseLifecycleStatus[] = [
  CourseLifecycleStatus.DRAFT,
  CourseLifecycleStatus.CHANGES_REQUESTED,
];

export function isCourseOwnerEditable(
  status: CourseLifecycleStatus,
  options?: {
    isOwner?: boolean;
    hasUnpublishedChanges?: boolean;
    revisionStatus?: CourseRevisionStatus | null;
  },
): boolean {
  if (OWNER_EDITABLE_STATUSES.includes(status)) {
    return true;
  }

  if (status === CourseLifecycleStatus.PUBLISHED && options?.isOwner) {
    if (
      options.hasUnpublishedChanges &&
      options.revisionStatus === CourseRevisionStatus.UNDER_REVIEW
    ) {
      return false;
    }
    return true;
  }

  if (
    status === CourseLifecycleStatus.PUBLISHED &&
    options?.hasUnpublishedChanges &&
    options.revisionStatus
  ) {
    return (
      options.revisionStatus === CourseRevisionStatus.DRAFT ||
      options.revisionStatus === CourseRevisionStatus.CHANGES_REQUESTED
    );
  }

  return false;
}
