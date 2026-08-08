'use client';

import { useEffect } from 'react';
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

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="space-y-3">
        <Label className="text-base font-bold text-foreground">Rating</Label>
        <RatingStars
          value={rating}
          interactive
          size="xl"
          onChange={(value) =>
            form.setValue('rating', value, { shouldValidate: true, shouldDirty: true })
          }
        />
        {form.formState.errors.rating ? (
          <p className="text-sm text-destructive">{form.formState.errors.rating.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title" className="text-base font-bold text-foreground">
          Review title
        </Label>
        <Input
          id="review-title"
          placeholder="Sum up your experience in a few words"
          className="h-11 rounded-none border-border text-base shadow-none focus-visible:ring-1"
          {...form.register('title')}
        />
        {form.formState.errors.title ? (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment" className="text-base font-bold text-foreground">
          Review content
        </Label>
        <Textarea
          id="review-comment"
          rows={6}
          placeholder="Tell others about your experience with this course"
          className="resize-y rounded-none border-border text-base shadow-none focus-visible:ring-1"
          {...form.register('comment')}
        />
        {form.formState.errors.comment ? (
          <p className="text-sm text-destructive">{form.formState.errors.comment.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="h-11 rounded-none border-foreground px-5 font-bold"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={submitting}
          className="h-11 min-w-[10rem] rounded-none bg-[#a435f0] px-6 font-bold text-white hover:bg-[#8710d8]"
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
