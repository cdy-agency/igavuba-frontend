'use client';

import { useMemo } from 'react';
import { CategoryCard } from '@/components/dashboard/courses/category-card';
import { CategoryListItem } from '@/components/dashboard/courses/category-list-item';
import { useCategoriesList } from '@/hooks/use-categories';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'cards';

interface CategoriesPanelProps {
  search: string;
  viewMode: ViewMode;
}

export function CategoriesPanel({ search, viewMode }: CategoriesPanelProps) {
  const authReady = useAuthReady();
  const { data: categories = [] as Category[], isPending, isFetching } = useCategoriesList(authReady);

  const filteredCategories = useMemo((): Category[] => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category: Category) => {
      const haystack = `${category.name} ${category.description ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [categories, search]);

  const showInitialSkeleton = isPending || (isFetching && categories.length === 0);

  if (showInitialSkeleton) {
    return viewMode === 'list' ? (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[4.25rem] animate-pulse rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center shadow-sm">
        <p className="text-sm font-medium text-foreground">No categories found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {search.trim()
            ? 'Try adjusting your search.'
            : 'Create your first category to organize courses.'}
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'space-y-3 rounded-lg border border-border/80 bg-muted/10 p-3',
          isFetching && 'pointer-events-none opacity-60',
        )}
      >
        {filteredCategories.map((category) => (
          <CategoryListItem key={category.id} category={category} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
        isFetching && 'pointer-events-none opacity-60',
      )}
    >
      {filteredCategories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
