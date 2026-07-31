import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const createTextContentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: optionalText,
  body: z.string().min(1, 'Body is required'),
});

export const createVideoContentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: optionalText,
  videoUrl: z.string().trim().url('Enter a valid video URL'),
  durationSeconds: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      return Number(value);
    },
    z.number().int().min(1).optional(),
  ),
});

export const createDocumentContentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: optionalText,
  fileUrl: z.string().trim().url('Enter a valid document URL'),
});

export const updateContentMetaSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255).optional(),
  description: optionalText,
});

export type CreateTextContentFormValues = z.infer<typeof createTextContentSchema>;
export type CreateVideoContentFormValues = z.infer<typeof createVideoContentSchema>;
export type CreateDocumentContentFormValues = z.infer<typeof createDocumentContentSchema>;
