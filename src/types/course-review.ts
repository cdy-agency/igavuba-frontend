import type { CourseLifecycleStatus } from '@/types/course-status';
import type { Course } from '@/types/course';

export enum CourseReviewDecision {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  RESUBMITTED = 'RESUBMITTED',
  REVISION_SUBMITTED = 'REVISION_SUBMITTED',
  REVISION_APPROVED = 'REVISION_APPROVED',
  REVISION_CHANGES_REQUESTED = 'REVISION_CHANGES_REQUESTED',
  REVISION_RESUBMITTED = 'REVISION_RESUBMITTED',
}

export interface CourseReviewQueueItem {
  id: string;
  title: string;
  slug: string;
  status: CourseLifecycleStatus;
  submittedForReviewAt: string | null;
  approvedAt: string | null;
  institution: { id: string; name: string };
  owner: { id: string; name: string | null; email: string };
}

export interface CourseReviewComment {
  id: string;
  title: string;
  comment: string;
  location: string | null;
  ownerResponse: string | null;
  resolvedAt: string | null;
  createdAt: string;
  resolvedBy?: { id: string; name: string | null; email: string } | null;
}

export interface CourseReviewRecord {
  id: string;
  decision: CourseReviewDecision;
  createdAt: string;
  reviewer?: { id: string; name: string | null; email: string; role: string } | null;
  submittedBy?: { id: string; name: string | null; email: string; role: string } | null;
  comments: CourseReviewComment[];
}

export interface ReviewCommentInput {
  title: string;
  comment: string;
  location?: string;
}

export interface CourseReviewDetail extends Course {
  modules?: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    order: number;
    moduleContents: Array<{
      id: string;
      order: number;
      content: {
        id: string;
        type: string;
        title: string;
        description: string | null;
        isPublished: boolean;
        assessment?: { id: string; type: string; title: string } | null;
      };
    }>;
  }>;
}

export interface CourseReviewCommentsResponse {
  reviewRecordId: string | null;
  requestedAt: string | null;
  reviewer: { id: string; name: string | null; email: string } | null;
  comments: CourseReviewComment[];
}

export interface CourseReviewListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseLifecycleStatus;
}
