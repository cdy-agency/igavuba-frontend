import { z } from 'zod';
import { CourseAccessType, CourseLevel } from '@/types/course';
import { COURSE_LANGUAGE_CODES } from '@/types/course-language';

const optionalUrl = z
  .string()
  .trim()
  .url('Enter a valid URL')
  .optional()
  .or(z.literal(''))
  .transform((value) => (value === '' ? undefined : value));

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

function parseEstimatedHours(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return NaN;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  const numericValue = Number(normalized);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)\s*(hours?|hrs?|h|weeks?|wks?|w)$/);
  if (!match) {
    return NaN;
  }

  const amount = Number(match[1]);
  if (Number.isNaN(amount)) {
    return NaN;
  }

  const unit = match[2];
  if (/^w/.test(unit)) {
    return amount * 168;
  }

  return amount;
}

export const courseFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  shortDescription: optionalText,
  description: optionalText,
  thumbnail: optionalUrl,
  previewVideo: optionalUrl,
  level: z.nativeEnum(CourseLevel).optional(),
  language: z.enum(COURSE_LANGUAGE_CODES).optional(),
  estimatedHours: z.preprocess(
    parseEstimatedHours,
    z.number().int('Estimated duration must be a whole number').min(1).optional(),
  ),
  accessType: z.nativeEnum(CourseAccessType, {
    required_error: 'Access type is required',
  }),
  publicPrice: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    },
    z.number().min(0, 'Price cannot be negative').optional(),
  ),
  departmentId: optionalText,
  lecturerId: optionalText,
  categoryIds: z.array(z.string().trim().min(1)).optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const createCourseSchema = courseFormSchema;

export const updateCourseSchema = courseFormSchema.partial().extend({
  title: z.string().trim().min(1, 'Title is required').max(255).optional(),
});

export type UpdateCourseFormValues = z.infer<typeof updateCourseSchema>;
