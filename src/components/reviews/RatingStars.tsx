'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingStarsProps = {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  showValue?: boolean;
};

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4.5 w-4.5 h-[18px] w-[18px]',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
};

/** Udemy-like gold star color */
const STAR_FILL = 'fill-[#f69c08] text-[#f69c08]';
const STAR_EMPTY = 'fill-transparent text-[#d1d2e0]';

export function RatingStars({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
  showValue = false,
}: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(max, value));

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div
        className="inline-flex items-center gap-0.5"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`${clamped.toFixed(1)} out of ${max} stars`}
      >
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const fillRatio = Math.max(0, Math.min(1, clamped - index));

          if (interactive) {
            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={starValue === Math.round(clamped)}
                className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a435f0]"
                onClick={() => onChange?.(starValue)}
              >
                <Star
                  className={cn(
                    sizeMap[size],
                    starValue <= clamped ? STAR_FILL : STAR_EMPTY,
                  )}
                />
              </button>
            );
          }

          return (
            <span key={starValue} className={cn('relative inline-block', sizeMap[size])}>
              <Star className={cn('absolute inset-0', sizeMap[size], STAR_EMPTY)} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillRatio * 100}%` }}
              >
                <Star className={cn(sizeMap[size], STAR_FILL)} />
              </span>
            </span>
          );
        })}
      </div>
      {showValue ? (
        <span className="text-sm font-bold tabular-nums text-[#b4690e]">
          {clamped.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}
