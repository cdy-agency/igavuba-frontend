'use client';

import { cn } from '@/lib/utils';
import { getCatalogPriceDisplay } from '@/lib/catalog-utils';
import type { CatalogCourseCard } from '@/types/catalog';

type PriceCourse = Pick<
  CatalogCourseCard,
  | 'accessType'
  | 'publicPrice'
  | 'originalPrice'
  | 'discountEnabled'
  | 'discountType'
  | 'discountValue'
  | 'discountStartAt'
  | 'discountEndAt'
  | 'isOnSale'
  | 'amountSaved'
  | 'discountLabel'
>;

export function CoursePriceDisplay({
  course,
  size = 'md',
  className,
}: {
  course: PriceCourse;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const display = getCatalogPriceDisplay(course);

  if (display.isFree) {
    return (
      <span
        className={cn(
          'font-bold text-foreground',
          size === 'lg' && 'text-3xl tracking-tight',
          size === 'md' && 'text-sm',
          size === 'sm' && 'text-xs',
          className,
        )}
      >
        Free
      </span>
    );
  }

  if (!display.isOnSale) {
    return (
      <span
        className={cn(
          'font-bold tabular-nums text-foreground',
          size === 'lg' && 'text-3xl tracking-tight',
          size === 'md' && 'text-sm',
          size === 'sm' && 'text-xs',
          className,
        )}
      >
        {display.currentLabel}
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex flex-col">
        {display.originalLabel ? (
          <span
            className={cn(
              'tabular-nums text-muted-foreground line-through',
              size === 'lg' && 'text-sm',
              size === 'md' && 'text-xs',
              size === 'sm' && 'text-[10px]',
            )}
          >
            {display.originalLabel}
          </span>
        ) : null}
        <span
          className={cn(
            'font-bold tabular-nums text-foreground',
            size === 'lg' && 'text-3xl tracking-tight',
            size === 'md' && 'text-sm',
            size === 'sm' && 'text-xs',
          )}
        >
          {display.currentLabel}
        </span>
      </div>
      {display.discountLabel ? (
        <span
          className={cn(
            'rounded-sm bg-emerald-100 px-1.5 py-0.5 font-bold uppercase tracking-wide text-emerald-800',
            size === 'lg' && 'text-xs',
            size === 'md' && 'text-[10px]',
            size === 'sm' && 'text-[9px]',
          )}
        >
          {display.discountLabel}
        </span>
      ) : null}
    </div>
  );
}
