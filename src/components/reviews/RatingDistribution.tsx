'use client';

import type { ReviewDistribution } from '@/types/review.types';
import { cn } from '@/lib/utils';

const STARS = [5, 4, 3, 2, 1] as const;

export function RatingDistribution({
  distribution,
  totalReviews,
  activeRating,
  onSelectRating,
}: {
  distribution: ReviewDistribution;
  totalReviews: number;
  activeRating?: number | null;
  onSelectRating?: (rating: number | null) => void;
}) {
  return (
    <div className="flex w-full flex-col justify-center gap-1.5">
      {STARS.map((star) => {
        const count = distribution[String(star) as keyof ReviewDistribution] ?? 0;
        const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
        const isActive = activeRating === star;
        const clickable = Boolean(onSelectRating);

        const content = (
          <>
            <span
              className={cn(
                'text-sm font-medium',
                clickable
                  ? 'text-primary underline decoration-primary/30 underline-offset-2 group-hover:decoration-primary'
                  : 'text-foreground',
                isActive && 'font-bold',
              )}
            >
              {star} {star === 1 ? 'star' : 'stars'}
            </span>
            <div className="h-2 overflow-hidden rounded-[1px] bg-border">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-right text-sm tabular-nums text-muted-foreground">
              {percent}%
            </span>
          </>
        );

        const className =
          'grid w-full grid-cols-[4.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 text-left';

        if (clickable) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onSelectRating?.(isActive ? null : star)}
              className={cn(className, 'group cursor-pointer')}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={star} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
