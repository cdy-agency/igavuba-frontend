'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewFilters } from '@/components/reviews/ReviewFilters';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { RatingStars } from '@/components/reviews/RatingStars';
import { useInfiniteCourseReviews, useCourseReviewSummary } from '@/hooks/use-reviews';
import type { ReviewSort } from '@/types/review.types';

export function CourseDetailReviewsSection({
  courseId,
  courseSlug,
  courseTitle,
  courseEnrollmentCount,
}: {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  courseEnrollmentCount: number;
}) {
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const listParams = useMemo(
    () => ({
      sort,
      search: debouncedSearch || undefined,
      rating: ratingFilter ?? undefined,
      limit: 8,
    }),
    [sort, debouncedSearch, ratingFilter],
  );

  const { data: summary, isPending: summaryLoading } = useCourseReviewSummary(courseSlug);
  const {
    data: pages,
    isPending: listLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCourseReviews(courseSlug, listParams);

  const reviews = pages?.pages.flatMap((page) => page.data) ?? [];
  const totalShown = pages?.pages[0]?.pagination.total ?? reviews.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section id="reviews" className="scroll-mt-24 space-y-8 border-t border-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-foreground">
            Student feedback
          </h2>
          {ratingFilter ? (
            <button
              type="button"
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => setRatingFilter(null)}
            >
              Clear {ratingFilter}-star filter
            </button>
          ) : null}
        </div>
      </div>

      {summaryLoading || !summary ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[22rem] items-center justify-center rounded-full border border-border bg-card px-3 py-2 text-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-muted/10 px-3 py-2 text-[1.65rem] font-semibold leading-none text-foreground">
              {summary.totalReviews > 0 ? summary.averageRating.toFixed(1) : '—'}
            </div>
            <div className="flex items-center gap-2">
              <RatingStars
                value={summary.totalReviews > 0 ? summary.averageRating : 0}
                size="sm"
              />
            </div>
            <div className="hidden h-5 w-px bg-border md:block" />
            <div className="min-w-0 text-[0.8rem] leading-snug text-muted-foreground">
              <span className="font-medium text-foreground">
                {summary.totalReviews.toLocaleString()}
              </span>{' '}
              reviews ·{' '}
              <span className="font-medium text-foreground">
                {courseEnrollmentCount.toLocaleString()}
              </span>{' '}
              learners
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5 border-t border-border pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="text-2xl font-bold text-foreground">
            Reviews
            {totalShown > 0 ? (
              <span className="ml-2 text-base font-medium text-muted-foreground">
                ({totalShown.toLocaleString()})
              </span>
            ) : null}
          </h3>
        </div>

        <ReviewFilters
          sort={sort}
          search={search}
          onSortChange={setSort}
          onSearchChange={setSearch}
        />

        {listLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <MessageSquareQuote className="mb-3 h-9 w-9 text-muted-foreground" />
            <p className="text-lg font-bold text-foreground">No reviews yet</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {ratingFilter || debouncedSearch
                ? 'No reviews match your filters. Try clearing search or star filters.'
                : 'Be the first verified learner to share your experience with this course.'}
            </p>
          </div>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : null}
            {hasNextPage && !isFetchingNextPage ? (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-none border-border font-bold text-foreground hover:bg-foreground hover:text-background"
                  onClick={() => void fetchNextPage()}
                >
                  Show more reviews
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <span className="sr-only">{courseId}</span>
    </section>
  );
}
