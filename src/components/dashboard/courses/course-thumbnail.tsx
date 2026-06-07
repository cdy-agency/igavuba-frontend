'use client';

import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseThumbnailProps {
  thumbnail: string | null;
  title: string;
  size?: 'list' | 'card';
  className?: string;
}

const sizeClasses = {
  list: 'h-14 w-[4.5rem]',
  card: 'h-12 w-12',
} as const;

export function CourseThumbnail({
  thumbnail,
  title,
  size = 'list',
  className,
}: CourseThumbnailProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded bg-muted',
        sizeClasses[size],
        className,
      )}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
          <BookOpen className={size === 'list' ? 'h-5 w-5' : 'h-4 w-4'} />
        </div>
      )}
    </div>
  );
}
