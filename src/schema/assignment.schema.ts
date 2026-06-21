import { z } from 'zod';
import { AssignmentSubmissionType } from '@/types/assignment.types';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const assignmentInfoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: optionalText,
  instructions: optionalText,
});

export const assignmentSettingsSchema = z.object({
  passingScore: z.coerce.number().int().min(0).max(100),
  maxAttempts: z.coerce.number().int().min(1),
  dueDate: z.string().optional().nullable(),
  allowLateSubmission: z.boolean(),
  showFeedbackAfterGrading: z.boolean(),
  submissionTypes: z
    .array(z.nativeEnum(AssignmentSubmissionType))
    .min(1, 'Select at least one submission type'),
});

export const createAssignmentFormSchema = assignmentInfoSchema.merge(assignmentSettingsSchema);

export type AssignmentInfoFormValues = z.infer<typeof assignmentInfoSchema>;
export type AssignmentSettingsFormValues = z.infer<typeof assignmentSettingsSchema>;
export type CreateAssignmentFormValues = z.infer<typeof createAssignmentFormSchema>;

export const defaultAssignmentSettings = (): AssignmentSettingsFormValues => ({
  passingScore: 70,
  maxAttempts: 1,
  dueDate: '',
  allowLateSubmission: false,
  showFeedbackAfterGrading: true,
  submissionTypes: [AssignmentSubmissionType.TEXT],
});
