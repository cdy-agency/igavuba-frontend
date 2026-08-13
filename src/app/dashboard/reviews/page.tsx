'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquareQuote, Star } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import { RatingStars } from '@/components/reviews/RatingStars';
import { Button } from '@/components/ui/button';
import {
  useHideReview,
  useReviewAnalytics,
  useUnhideReview,
  reviewQueryKeys,
} from '@/hooks/use-reviews';
import { getModerationReviews } from '@/api/review.api';
import { useQuery } from '@tanstack/react-query';
import { useDashboard } from '@/contexts/dashboard-context';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import type {
  CourseReview,
  ReviewAnalytics,
  ReviewSummary as ReviewSummaryType,
} from '@/types/review.types';

function isScopedAnalytics(data: unknown): data is ReviewAnalytics {
  return Boolean(data && typeof data === 'object' && 'highestRatedCourses' in data);
}

function ReviewsDashboardContent() {
  const { role } = useDashboard();
  const canModerate =
    role === UserRole.INSTITUTION_ADMIN || role === UserRole.SUPER_ADMIN;
  const [includeHidden, setIncludeHidden] = useState(true);

  const { data: analytics, isPending: analyticsLoading } = useReviewAnalytics(
    undefined,
    true,
  );
  const { data: moderation, isPending: moderationLoading } = useQuery({
    queryKey: [...reviewQueryKeys.moderation, includeHidden],
    queryFn: () => getModerationReviews({ page: 1, limit: 50, includeHidden }),
    enabled: canModerate,
  });
  const hideReview = useHideReview();
  const unhideReview = useUnhideReview();

  const scoped = isScopedAnalytics(analytics) ? analytics : null;
  const courseSummary =
    analytics && !isScopedAnalytics(analytics)
      ? (analytics as { summary: ReviewSummaryType }).summary
      : null;

  const summary: ReviewSummaryType | null = useMemo(() => {
    if (scoped) {
      return {
        averageRating: scoped.averageRating,
        totalReviews: scoped.totalReviews,
        distribution: scoped.distribution,
      };
    }
    return courseSummary;
  }, [scoped, courseSummary]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course reviews"
        description="Learner ratings and feedback for completed courses. Hidden reviews stay stored for moderation."
        badge="Quality"
        actions={
          canModerate ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIncludeHidden((value) => !value)}
            >
              {includeHidden ? 'Hide moderated list filter' : 'Show hidden reviews'}
            </Button>
          ) : null
        }
      />

      {analyticsLoading || !summary ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
          <ReviewSummary summary={summary} />
        </div>
      )}

      {scoped ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Highest rated courses
            </h3>
            <div className="space-y-3">
              {scoped.highestRatedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rated courses yet.</p>
              ) : (
                scoped.highestRatedCourses.map((course) => (
                  <Link
                    key={course.courseId}
                    href={`/courses/${course.slug}#reviews`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.totalReviews} review{course.totalReviews === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingStars value={course.averageRating} size="sm" />
                      <span className="text-sm font-semibold tabular-nums">
                        {course.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Latest feedback
            </h3>
            <div className="space-y-3">
              {scoped.recentReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                scoped.recentReviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border/60 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{review.course.title}</p>
                      <RatingStars value={review.rating} size="sm" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {review.comment?.trim() || 'Rated without a comment'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {canModerate ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Moderation queue</h3>
          </div>
          {moderationLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : !moderation?.data.length ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              No reviews to moderate.
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background px-4 sm:px-5">
              {moderation.data.map((review: CourseReview) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canModerate
                  onHide={() => {
                    const reason = window.prompt('Reason for hiding this review (optional)') ?? undefined;
                    void hideReview.mutateAsync({ reviewId: review.id, reason });
                  }}
                  onUnhide={() => void unhideReview.mutateAsync(review.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardLearnerReviewsPage() {
  return (
    <RoleGuard
      allowedRoles={[
        UserRole.LECTURER,
        UserRole.INSTITUTION_ADMIN,
        UserRole.SUPER_ADMIN,
      ]}
    >
      <ReviewsDashboardContent />
    </RoleGuard>
  );
}
