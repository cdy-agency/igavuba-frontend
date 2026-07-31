import type { CourseLifecycleStatus } from './course-status';

export enum CourseRevisionStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export const COURSE_REVISION_LABELS: Record<CourseRevisionStatus, string> = {
  [CourseRevisionStatus.DRAFT]: 'Draft revision',
  [CourseRevisionStatus.UNDER_REVIEW]: 'Pending review',
  [CourseRevisionStatus.CHANGES_REQUESTED]: 'Changes requested',
};

export interface CourseRevisionQueueItem {
  id: string;
  title: string;
  slug: string;
  status: CourseLifecycleStatus;
  revisionStatus: CourseRevisionStatus | null;
  hasUnpublishedChanges: boolean;
  publishedAt: string | null;
  submittedForReviewAt: string | null;
  institution: { id: string; name: string };
  owner: { id: string; name: string | null; email: string };
}

export interface CourseRevisionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseRevisionStatus;
}

export interface RevisionComparisonSummary {
  metadataChanged: string[];
  modulesAdded: string[];
  modulesRemoved: string[];
  modulesChanged: string[];
  lessonsChanged: string[];
}

export interface CourseRevisionCompareResponse {
  published: unknown;
  pending: unknown;
  comparison: RevisionComparisonSummary;
  revisionStatus: CourseRevisionStatus | null;
}

export interface CourseRevisionCommentsResponse {
  reviewRecordId: string | null;
  requestedAt: string | null;
  reviewer: { id: string; name: string | null; email: string } | null;
  comments: import('./course-review').CourseReviewComment[];
}
