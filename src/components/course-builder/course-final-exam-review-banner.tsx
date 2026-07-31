'use client';

import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseLifecycleStatus } from '@/types/course-status';
import { CourseRevisionStatus } from '@/types/course-revision';

interface CourseFinalExamReviewBannerProps {
  courseStatus: string;
  hasUnpublishedChanges?: boolean;
  revisionStatus?: CourseRevisionStatus | null;
  readOnly?: boolean;
  onSubmitRevision?: () => void;
  onResubmitRevision?: () => void;
  isSubmitting?: boolean;
  canResubmit?: boolean;
}

export function CourseFinalExamReviewBanner({
  courseStatus,
  hasUnpublishedChanges,
  revisionStatus,
  readOnly = false,
  onSubmitRevision,
  onResubmitRevision,
  isSubmitting = false,
  canResubmit = true,
}: CourseFinalExamReviewBannerProps) {
  const isPublished = courseStatus === CourseLifecycleStatus.PUBLISHED;

  if (!isPublished || !hasUnpublishedChanges || !revisionStatus) {
    return null;
  }

  if (revisionStatus === CourseRevisionStatus.UNDER_REVIEW) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        This final exam is waiting for institution admin approval. Learners will not see it until
        the revision is approved.
      </div>
    );
  }

  if (revisionStatus === CourseRevisionStatus.CHANGES_REQUESTED) {
    return (
      <div className="space-y-3 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
        <p>An admin requested changes. Update the exam, then resubmit the course revision.</p>
        {!readOnly && onResubmitRevision ? (
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || !canResubmit}
            onClick={onResubmitRevision}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Resubmit revision
          </Button>
        ) : null}
      </div>
    );
  }

  if (revisionStatus === CourseRevisionStatus.DRAFT && !readOnly && onSubmitRevision) {
    return (
      <div className="space-y-3 rounded-md border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
        <p>
          This final exam is saved as a draft. Submit the course revision for review so an
          institution admin can approve it before learners see it.
        </p>
        <Button type="button" size="sm" disabled={isSubmitting} onClick={onSubmitRevision}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Submit revision for review
        </Button>
      </div>
    );
  }

  return null;
}
