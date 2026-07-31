import { z } from 'zod';

export const contentProgressQuerySchema = z.object({
  courseId: z.string().min(1).optional(),
});

export type ContentProgressQuery = z.infer<typeof contentProgressQuerySchema>;
