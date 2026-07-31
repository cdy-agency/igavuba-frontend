import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  courseId: z.string().trim().min(1, 'Course is required'),
});

export const assignLearnersSchema = z.object({
  learnerIds: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one learner is required'),
});

export type CreateEnrollmentFormValues = z.infer<typeof createEnrollmentSchema>;
export type AssignLearnersFormValues = z.infer<typeof assignLearnersSchema>;
