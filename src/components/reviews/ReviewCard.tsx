'use client';

import { BadgeCheck, Pencil, Trash2 } from 'lucide-react';
import { RatingStars } from '@/components/reviews/RatingStars';
import { Button } from '@/components/ui/button';
import type { CourseReview } from '@/types/review.types';
import { formatRelativeTime } from '@/lib/notification-utils';
import { cn } from '@/lib/utils';

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatRelativeTime(value);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ReviewCard({
  review,
  canEdit = false,
  canModerate = false,
  onEdit,
  onDelete,
  onHide,
  onUnhide,
}: {
  review: CourseReview;
  canEdit?: boolean;
  canModerate?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onHide?: () => void;
  onUnhide?: () => void;
}) {
  const initials = review.learner.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article
      className={cn(
        'grid gap-4 border-b border-[#d1d2e0] py-6 last:border-b-0 sm:grid-cols-[48px_minmax(0,1fr)]',
        review.isHidden && 'opacity-60',
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1c1d1f] text-sm font-bold text-white">
        {initials || 'L'}
      </div>

      <div className="min-w-0 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-bold text-[#1c1d1f]">
                {review.learner.name}
              </p>
              {review.verifiedLearner ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1e6055]">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Learner
                </span>
              ) : null}
              {review.isHidden ? (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  Hidden
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RatingStars value={review.rating} size="sm" />
              <span className="text-xs font-medium text-[#6a6f73]">
                {formatReviewDate(review.createdAt)}
              </span>
            </div>
          </div>

          {(canEdit || canModerate) && (
            <div className="flex shrink-0 items-center gap-1">
              {canEdit ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#6a6f73] hover:text-[#1c1d1f]"
                    onClick={onEdit}
                    aria-label="Edit review"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#6a6f73] hover:text-destructive"
                    onClick={onDelete}
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : null}
              {canModerate ? (
                review.isHidden ? (
                  <Button type="button" variant="outline" size="sm" onClick={onUnhide}>
                    Restore
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={onHide}>
                    Hide
                  </Button>
                )
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[15px] font-bold leading-snug text-[#1c1d1f]">
            {review.title}
          </h3>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#2d2f31]">
            {review.comment}
          </p>
        </div>
      </div>
    </article>
  );
}
