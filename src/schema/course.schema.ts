import { z } from 'zod';
import { CourseAccessType, CourseLevel } from '@/types/course';
import { COURSE_LANGUAGE_CODES } from '@/types/course-language';
import { DiscountType } from '@/lib/course-pricing';

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

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return Number(value);
}, z.number().min(0, 'Value cannot be negative').optional());

const courseFormObjectSchema = z.object({
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
  /** Calculated selling price — kept for API compatibility. */
  publicPrice: optionalNumber,
  originalPrice: optionalNumber,
  discountEnabled: z.boolean().optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: optionalNumber,
  discountStartAt: z
    .string()
    .optional()
    .transform((value) => (!value ? undefined : value)),
  discountEndAt: z
    .string()
    .optional()
    .transform((value) => (!value ? undefined : value)),
  departmentId: optionalText,
  lecturerId: optionalText,
  categoryIds: z.array(z.string().trim().min(1)).optional(),
});

function refineCoursePricing(
  values: z.infer<typeof courseFormObjectSchema>,
  ctx: z.RefinementCtx,
) {
  const needsPrice =
    values.accessType === CourseAccessType.PUBLIC_PAID ||
    values.accessType === CourseAccessType.HYBRID;

  if (!needsPrice) return;

  if (values.originalPrice == null && values.publicPrice == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Regular price is required for paid courses',
      path: ['originalPrice'],
    });
  }

  if (!values.discountEnabled) return;

  if (!values.discountType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Select a discount type',
      path: ['discountType'],
    });
  }

  if (values.discountValue == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a discount value',
      path: ['discountValue'],
    });
  } else if (
    values.discountType === DiscountType.PERCENTAGE &&
    values.discountValue > 100
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Percentage discount cannot exceed 100',
      path: ['discountValue'],
    });
  } else if (
    values.discountType === DiscountType.FIXED_AMOUNT &&
    values.originalPrice != null &&
    values.discountValue > values.originalPrice
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Fixed discount cannot exceed the regular price',
      path: ['discountValue'],
    });
  }
}

export const courseFormSchema = courseFormObjectSchema.superRefine(refineCoursePricing);

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const createCourseSchema = courseFormSchema;

export const updateCourseSchema = courseFormObjectSchema
  .partial()
  .extend({
    title: z.string().trim().min(1, 'Title is required').max(255).optional(),
  })
  .superRefine((values, ctx) => {
    // Only enforce pricing rules when access type is present in the patch.
    if (!values.accessType) return;
    refineCoursePricing(values as z.infer<typeof courseFormObjectSchema>, ctx);
  });

export type UpdateCourseFormValues = z.infer<typeof updateCourseSchema>;
