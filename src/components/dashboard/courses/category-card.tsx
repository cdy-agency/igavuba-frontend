'use client';

import { BookOpen, Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const courseLabel =
    category.publishedCourseCount === 1
      ? '1 course'
      : `${category.publishedCourseCount} courses`;

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
        <Folder className="h-5 w-5" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
        {category.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{category.description}</p>
        ) : null}
      </div>

      <Badge
        variant="secondary"
        className="h-6 w-fit gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 text-[0.6875rem] font-medium text-violet-700 hover:bg-violet-50"
      >
        <BookOpen className="h-3 w-3" />
        {courseLabel}
      </Badge>
    </article>
  );
}
