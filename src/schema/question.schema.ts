import { z } from 'zod';
import { QuestionType } from '@/types/question';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const questionOptionSchema = z.object({
  clientId: z.string(),
  id: z.string().optional(),
  text: z.string().trim().min(1, 'Option text is required').max(1000),
  isCorrect: z.boolean(),
});

export const draftQuestionSchema = z
  .object({
    clientId: z.string(),
    id: z.string().optional(),
    type: z.nativeEnum(QuestionType),
    title: z.string().trim().min(1, 'Question title is required').max(1000),
    instructions: optionalText,
    explanation: optionalText,
    points: z.coerce.number().int().min(1, 'Points must be at least 1'),
    options: z.array(questionOptionSchema),
  })
  .superRefine((question, ctx) => {
    if (question.type === QuestionType.ESSAY) {
      return;
    }

    if (question.options.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Add at least one option',
        path: ['options'],
      });
      return;
    }

    const correctCount = question.options.filter((option) => option.isCorrect).length;

    if (question.type === QuestionType.SINGLE_CHOICE) {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Single choice questions need at least 2 options',
          path: ['options'],
        });
      }
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select exactly one correct option',
          path: ['options'],
        });
      }
    }

    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Multiple choice questions need at least 2 options',
          path: ['options'],
        });
      }
      if (correctCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select at least one correct option',
          path: ['options'],
        });
      }
    }

    if (question.type === QuestionType.TRUE_FALSE) {
      if (question.options.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'True/False questions must have exactly 2 options',
          path: ['options'],
        });
      }
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select exactly one correct option',
          path: ['options'],
        });
      }
    }
  });

export const questionBuilderSchema = z.object({
  questions: z.array(draftQuestionSchema).min(1, 'Add at least one question'),
});

export type DraftQuestionOptionValues = z.infer<typeof questionOptionSchema>;
export type DraftQuestionValues = z.infer<typeof draftQuestionSchema>;
export type QuestionBuilderFormValues = z.infer<typeof questionBuilderSchema>;
