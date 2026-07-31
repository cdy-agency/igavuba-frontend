'use client';

import { BookOpen, Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface CategoryListItemProps {
  category: Category;
  className?: string;
}

export function CategoryListItem({ category, className }: CategoryListItemProps) {
  const courseLabel =
    category.publishedCourseCount === 1
      ? '1 course'
      : `${category.publishedCourseCount} courses`;

  return (
    <article
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
        <Folder className="h-5 w-5" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground sm:text-[0.9375rem]">
          {category.name}
        </h3>
        {category.description ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{category.description}</p>
        ) : null}
      </div>

      <Badge
        variant="secondary"
        className="h-6 shrink-0 gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 text-[0.6875rem] font-medium text-violet-700 hover:bg-violet-50"
      >
        <BookOpen className="h-3 w-3" />
        {courseLabel}
      </Badge>
    </article>
  );
}
