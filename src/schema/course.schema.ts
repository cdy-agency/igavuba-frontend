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

export const courseFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  shortDescription: optionalText,
  description: optionalText,
  thumbnail: optionalUrl,
  previewVideo: optionalUrl,
  level: z.nativeEnum(CourseLevel).optional(),
  language: z.enum(COURSE_LANGUAGE_CODES).optional(),
  estimatedHours: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    },
    z.number().int('Estimated hours must be a whole number').min(1).optional(),
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
