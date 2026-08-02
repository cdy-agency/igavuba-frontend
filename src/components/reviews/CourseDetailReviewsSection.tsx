'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import { ReviewFilters } from '@/components/reviews/ReviewFilters';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import {
  useCreateOrUpdateReview,
  useDeleteReview,
  useInfiniteCourseReviews,
  useReviewEligibility,
  useCourseReviewSummary,
} from '@/hooks/use-reviews';
import { useAuth } from '@/lib/hooks/use-auth';
import type { ReviewSort } from '@/types/review.types';
import { UserRole } from '@/types/enum';

export function CourseDetailReviewsSection({
  courseId,
  courseSlug,
  courseTitle,
}: {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
}) {
  const { user, isAuthenticated } = useAuth();
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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
  const { data: eligibility } = useReviewEligibility(
    courseSlug,
    isAuthenticated && user?.role === UserRole.LEARNER,
  );
  const saveReview = useCreateOrUpdateReview(courseSlug);
  const deleteReview = useDeleteReview();

  const reviews = pages?.pages.flatMap((page) => page.data) ?? [];
  const myReview = eligibility?.myReview ?? null;
  const canWrite = Boolean(eligibility?.canReview);
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
    <section id="reviews" className="scroll-mt-24 space-y-8 border-t border-[#d1d2e0] pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-[#1c1d1f]">
            Student feedback
          </h2>
          {ratingFilter ? (
            <button
              type="button"
              className="text-sm font-medium text-[#5624d0] underline-offset-2 hover:underline"
              onClick={() => setRatingFilter(null)}
            >
              Clear {ratingFilter}-star filter
            </button>
          ) : null}
        </div>

        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-none border-[#1c1d1f] px-5 font-bold text-[#1c1d1f] hover:bg-[#1c1d1f] hover:text-white"
            onClick={() => setModalOpen(true)}
          >
            {myReview ? 'Edit your review' : 'Write a review'}
          </Button>
        ) : null}
      </div>

      {summaryLoading || !summary ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#5624d0]" />
        </div>
      ) : (
        <ReviewSummary
          summary={summary}
          activeRating={ratingFilter}
          onSelectRating={setRatingFilter}
        />
      )}

      <div className="space-y-5 border-t border-[#d1d2e0] pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="text-2xl font-bold text-[#1c1d1f]">
            Reviews
            {totalShown > 0 ? (
              <span className="ml-2 text-base font-medium text-[#6a6f73]">
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
            <Loader2 className="h-5 w-5 animate-spin text-[#5624d0]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <MessageSquareQuote className="mb-3 h-9 w-9 text-[#6a6f73]" />
            <p className="text-lg font-bold text-[#1c1d1f]">No reviews yet</p>
            <p className="mt-1 max-w-md text-sm text-[#6a6f73]">
              {ratingFilter || debouncedSearch
                ? 'No reviews match your filters. Try clearing search or star filters.'
                : 'Be the first verified learner to share your experience with this course.'}
            </p>
          </div>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                canEdit={myReview?.id === review.id}
                onEdit={() => setModalOpen(true)}
                onDelete={() => {
                  if (confirm('Delete your review?')) {
                    void deleteReview.mutateAsync(review.id);
                  }
                }}
              />
            ))}
            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-[#6a6f73]" />
              </div>
            ) : null}
            {hasNextPage && !isFetchingNextPage ? (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-none border-[#1c1d1f] font-bold text-[#1c1d1f] hover:bg-[#1c1d1f] hover:text-white"
                  onClick={() => void fetchNextPage()}
                >
                  Show more reviews
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ReviewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        courseTitle={courseTitle}
        initialReview={myReview}
        submitting={saveReview.isPending}
        onSubmit={async (values) => {
          await saveReview.mutateAsync(values);
        }}
      />

      <span className="sr-only">{courseId}</span>
    </section>
  );
}
