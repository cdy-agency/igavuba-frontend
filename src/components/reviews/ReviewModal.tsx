'use client';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 rounded-none border-border p-0 shadow-xl sm:rounded-none">
        <DialogHeader className="space-y-1 border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {initialReview ? 'Edit your review' : 'How would you rate this course?'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {initialReview
              ? `Update your feedback for “${courseTitle}”.`
              : `Share your experience with “${courseTitle}”. Your review helps other learners decide.`}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <ReviewForm
            initialReview={initialReview}
            submitting={submitting}
            submitLabel={initialReview ? 'Update review' : 'Save and continue'}
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
