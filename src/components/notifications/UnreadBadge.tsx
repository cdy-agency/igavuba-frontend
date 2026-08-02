'use client';

import { cn } from '@/lib/utils';

export function UnreadBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background',
        className,
      )}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
