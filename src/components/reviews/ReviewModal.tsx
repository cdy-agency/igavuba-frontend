'use client';

import { MessageSquareQuote, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import type { CourseReview } from '@/types/review.types';
import type { ReviewFormValues } from '@/schema/review.schema';
import { cn } from '@/lib/utils';

export function ReviewModal({
  open,
  onOpenChange,
  courseTitle,
  initialReview,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  initialReview?: CourseReview | null;
  submitting?: boolean;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
}) {
  const isEditing = Boolean(initialReview);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-xl gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-2xl',
          '[&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:bg-white/15',
          '[&>button]:text-white [&>button]:opacity-90 [&>button]:hover:bg-white/25 [&>button]:hover:opacity-100',
          '[&>button]:focus:ring-white/40',
        )}
      >
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,var(--primary-deep)_0%,var(--primary)_55%,var(--primary-light)_100%)] px-6 pb-8 pt-6 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
          />

          <DialogHeader className="relative space-y-3 text-left text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
              {isEditing ? (
                <MessageSquareQuote className="h-5 w-5" />
              ) : (
                <Star className="h-5 w-5 fill-white/90 text-white" />
              )}
            </div>
            <DialogTitle className="!text-white text-xl font-bold tracking-tight sm:text-2xl">
              {isEditing ? 'Edit your review' : 'How would you rate this course?'}
            </DialogTitle>
            <DialogDescription className="!text-white/90 text-sm leading-relaxed [&_span]:!text-white">
              {isEditing ? (
                <>
                  Update your feedback for{' '}
                  <span className="font-semibold">{courseTitle}</span>.
                </>
              ) : (
                <>
                  Share your experience with{' '}
                  <span className="font-semibold">{courseTitle}</span>. Your review helps other
                  learners choose the right course.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="bg-card px-6 py-6">
          <ReviewForm
            initialReview={initialReview}
            submitting={submitting}
            submitLabel={isEditing ? 'Update review' : 'Save and continue'}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (values) => {
              await onSubmit(values);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
