import { z } from 'zod';

export const reviewFormSchema = z.object({
  rating: z
    .number({ required_error: 'Rating is required' })
    .int()
    .min(1, 'Select at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string().trim().max(5000, 'Comment is too long').optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
