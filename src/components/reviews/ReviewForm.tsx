'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RatingStars } from '@/components/reviews/RatingStars';
import { reviewFormSchema, type ReviewFormValues } from '@/schema/review.schema';
import type { CourseReview } from '@/types/review.types';
import { cn } from '@/lib/utils';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor — needs improvement',
  2: 'Fair — below expectations',
  3: 'Good — met expectations',
  4: 'Very good — would recommend',
  5: 'Excellent — outstanding course',
};

function getRatingLabel(rating: number) {
  if (rating < 1) return 'Tap a star to rate this course';
  return RATING_LABELS[rating] ?? '';
}

export function ReviewForm({
  initialReview,
  submitting,
  onSubmit,
  onCancel,
  submitLabel = 'Save and continue',
}: {
  initialReview?: CourseReview | null;
  submitting?: boolean;
  onSubmit: (values: ReviewFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: initialReview?.rating ?? 0,
      title: initialReview?.title ?? '',
      comment: initialReview?.comment ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      rating: initialReview?.rating ?? 0,
      title: initialReview?.title ?? '',
      comment: initialReview?.comment ?? '',
    });
  }, [initialReview, form]);

  const rating = form.watch('rating');
  const comment = form.watch('comment');
  const ratingLabel = useMemo(() => getRatingLabel(rating), [rating]);

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div
        className={cn(
          'rounded-xl border px-5 py-5 transition-colors',
          rating > 0
            ? 'border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,white)]'
            : 'border-border bg-[var(--primary-subtle)]',
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your rating
          </Label>
          <RatingStars
            value={rating}
            interactive
            size="xl"
            onChange={(value) =>
              form.setValue('rating', value, { shouldValidate: true, shouldDirty: true })
            }
          />
          <p
            className={cn(
              'min-h-[1.25rem] text-sm font-medium transition-colors',
              rating > 0 ? 'text-[var(--accent)]' : 'text-muted-foreground',
            )}
          >
            {ratingLabel}
          </p>
        </div>
        {form.formState.errors.rating ? (
          <p className="mt-2 text-center text-sm text-destructive">
            {form.formState.errors.rating.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title" className="text-sm font-semibold text-foreground">
          Review title
        </Label>
        <Input
          id="review-title"
          placeholder="Sum up your experience in a few words"
          className="h-11 rounded-lg border-border bg-background text-base shadow-none focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/20"
          {...form.register('title')}
        />
        {form.formState.errors.title ? (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="review-comment" className="text-sm font-semibold text-foreground">
            Review content
          </Label>
          <span className="text-xs text-muted-foreground">{comment.length} characters</span>
        </div>
        <Textarea
          id="review-comment"
          rows={5}
          placeholder="What did you learn? What stood out? Would you recommend this course?"
          className="min-h-[120px] resize-y rounded-lg border-border bg-background text-base shadow-none focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/20"
          {...form.register('comment')}
        />
        {form.formState.errors.comment ? (
          <p className="text-sm text-destructive">{form.formState.errors.comment.message}</p>
        ) : null}
      </div>

      <div className="-mx-6 -mb-6 mt-2 flex flex-wrap justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="h-11 rounded-lg border-border px-5 font-semibold"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={submitting}
          className="h-11 min-w-[11rem] rounded-lg bg-[var(--primary)] px-6 font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
