import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  description: optionalText,
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  name: z.string().trim().min(1, 'Name is required').max(120).optional(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;
