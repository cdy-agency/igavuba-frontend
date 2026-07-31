import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const quizSettingsSchema = z.object({
  showResults: z.boolean(),
  showCorrectAnswers: z.boolean(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
});

export const quizInfoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: optionalText,
  moduleId: z.string().trim().min(1, 'Module is required').optional(),
  courseId: z.string().trim().min(1, 'Course is required').optional(),
});

export const quizSettingsFormSchema = z.object({
  passingScore: z.coerce.number().int().min(0, 'Passing score must be at least 0').max(100),
  maxAttempts: z.coerce.number().int().min(1, 'Max attempts must be at least 1'),
  timeLimitMinutes: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      return Number(value);
    },
    z.number().int().min(1, 'Time limit must be at least 1 minute').optional(),
  ),
  settings: quizSettingsSchema,
});

export const createQuizWizardSchema = quizInfoSchema.merge(quizSettingsFormSchema);

export type QuizInfoFormValues = z.infer<typeof quizInfoSchema>;
export type QuizSettingsFormValues = z.infer<typeof quizSettingsFormSchema>;
export type CreateQuizWizardValues = z.infer<typeof createQuizWizardSchema>;
