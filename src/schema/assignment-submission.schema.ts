import { z } from 'zod';
import { AssignmentSubmissionType } from '@/types/assignment.types';

export function hasRichTextContent(html?: string | null): boolean {
  if (!html?.trim()) return false;
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 0;
}

export const submitAssignmentSchema = z
  .object({
    textAnswer: z.string().optional(),
    fileUrl: z.string().url('Enter a valid file URL').optional().or(z.literal('')),
    linkUrl: z.string().url('Enter a valid link URL').optional().or(z.literal('')),
    enabledTypes: z.array(z.nativeEnum(AssignmentSubmissionType)).min(1),
  })
  .superRefine((values, context) => {
    const hasText =
      values.enabledTypes.includes(AssignmentSubmissionType.TEXT) &&
      hasRichTextContent(values.textAnswer);
    const hasFile =
      values.enabledTypes.includes(AssignmentSubmissionType.FILE) &&
      Boolean(values.fileUrl?.trim());
    const hasLink =
      values.enabledTypes.includes(AssignmentSubmissionType.LINK) &&
      Boolean(values.linkUrl?.trim());

    if (!hasText && !hasFile && !hasLink) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide at least one enabled submission type',
        path: ['textAnswer'],
      });
    }
  });

export const gradeAssignmentSubmissionSchema = (maxScore = 100) =>
  z.object({
    score: z.coerce.number().min(0).max(maxScore, `Score cannot exceed ${maxScore}`),
    feedback: z.string().trim().max(10000).optional(),
  });

export type GradeAssignmentSubmissionFormValues = z.infer<
  ReturnType<typeof gradeAssignmentSubmissionSchema>
>;

export type SubmitAssignmentFormValues = z.infer<typeof submitAssignmentSchema>;
