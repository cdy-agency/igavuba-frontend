'use client';

import { RatingStars } from '@/components/reviews/RatingStars';
import { RatingDistribution } from '@/components/reviews/RatingDistribution';
import type { ReviewSummary as ReviewSummaryData } from '@/types/review.types';

export function ReviewSummary({
  summary,
  activeRating,
  onSelectRating,
}: {
  summary: ReviewSummaryData;
  activeRating?: number | null;
  onSelectRating?: (rating: number | null) => void;
}) {
  const { averageRating, totalReviews, distribution } = summary;
  const hasReviews = totalReviews > 0;

  return (
    <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:items-center md:gap-10">
      <div className="flex flex-col items-start gap-2 md:items-center md:text-center">
        <p className="text-[4rem] font-bold leading-none tracking-tight text-[#b4690e]">
          {hasReviews ? averageRating.toFixed(1) : '—'}
        </p>
        <RatingStars value={hasReviews ? averageRating : 0} size="lg" />
        <p className="text-sm font-bold text-[#b4690e]">Course Rating</p>
        <p className="text-sm text-muted-foreground">
          {hasReviews
            ? `${totalReviews.toLocaleString()} rating${totalReviews === 1 ? '' : 's'}`
            : 'No ratings yet'}
        </p>
      </div>

      <RatingDistribution
        distribution={distribution}
        totalReviews={totalReviews}
        activeRating={activeRating}
        onSelectRating={onSelectRating}
      />
    </div>
  );
}
