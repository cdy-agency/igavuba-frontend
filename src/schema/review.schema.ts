import { z } from 'zod';

export const reviewFormSchema = z.object({
  rating: z
    .number({ required_error: 'Rating is required' })
    .int()
    .min(1, 'Select at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title is too long'),
  comment: z
    .string()
    .trim()
    .min(10, 'Please share a bit more detail (at least 10 characters)')
    .max(5000, 'Comment is too long'),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
