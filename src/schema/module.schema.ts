import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const createModuleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: optionalText,
});

export const updateModuleSchema = createModuleSchema.partial().extend({
  title: z.string().trim().min(1, 'Title is required').max(255).optional(),
});

export type CreateModuleFormValues = z.infer<typeof createModuleSchema>;
export type UpdateModuleFormValues = z.infer<typeof updateModuleSchema>;
