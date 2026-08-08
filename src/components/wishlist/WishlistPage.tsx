'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WishlistCard, WishlistEmptyState } from '@/components/wishlist/WishlistCard';
import { useWishlistContext } from '@/providers/wishlist-provider';
import { cn } from '@/lib/utils';

type WishlistPageProps = {
  variant?: 'dashboard' | 'public';
};

export function WishlistPage({ variant = 'dashboard' }: WishlistPageProps) {
  const { wishlistItems, isLoading } = useWishlistContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const item of wishlistItems) {
      const name = item.course?.categories[0]?.category?.name;
      if (name) names.add(name);
    }
    return Array.from(names).sort();
  }, [wishlistItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wishlistItems.filter((item) => {
      const course = item.course;
      if (!course) return false;
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.institution.name.toLowerCase().includes(q);
      const categoryName = course.categories[0]?.category?.name ?? '';
      const matchesCategory = category === 'all' || categoryName === category;
      return matchesSearch && matchesCategory;
    });
  }, [wishlistItems, search, category]);

  const countLabel =
    filtered.length === 1 ? '1 course' : `${filtered.length} courses`;

  return (
    <div
      className={cn(
        'w-full',
        variant === 'public'
          ? 'mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10 lg:px-10'
          : 'space-y-6',
      )}
    >
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5 fill-current" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                Saved for later
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              My wishlist
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              Courses you bookmarked. Enroll when you are ready to start learning.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{countLabel}</span>
            {search || category !== 'all' ? ' matching filters' : ' saved'}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your wishlist"
              className="h-11 rounded-md border-border/80 bg-background pl-9 shadow-none"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 w-full rounded-md sm:w-52">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className={cn(variant === 'public' ? 'pt-2' : 'pt-0')}>
        {isLoading && wishlistItems.length === 0 ? (
          <div className="flex min-h-[18rem] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <WishlistEmptyState />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-6 py-14 text-center">
            <p className="font-medium text-foreground">No courses match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or clear the category filter.
            </p>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setSearch('');
                setCategory('all');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background px-4 shadow-sm sm:px-6">
            {filtered.map((item) => (
              <WishlistCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {variant === 'public' && wishlistItems.length > 0 ? (
        <p className="pt-6 text-center text-sm text-muted-foreground">
          Looking for more?{' '}
          <Link href="/courses" className="font-medium text-primary underline-offset-4 hover:underline">
            Explore the catalog
          </Link>
        </p>
      ) : null}
    </div>
  );
}
