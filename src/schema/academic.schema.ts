import { z } from 'zod';

export const assessmentAcademicRulesSchema = z.object({
  required: z.boolean(),
  countsTowardCertificate: z.boolean(),
  blockProgressUntilPassed: z.boolean(),
  passingScore: z.coerce.number().min(0).max(100),
  maxAttempts: z.coerce.number().int().min(1),
});

export const courseAcademicPolicySchema = z.object({
  // New course-wide configuration
  requireCourseCompletion: z.boolean().optional(),
  certificateGenerationStrategy: z.enum(['AUTOMATIC', 'MANUAL_APPROVAL']).optional(),
  defaultPassingScore: z.coerce.number().min(0).max(100).optional(),
  defaultMaxAttempts: z.coerce.number().int().min(1).optional(),
  defaultBlockProgressUntilPassed: z.boolean().optional(),
  // legacy flags (may be present but backend will treat assessments as source-of-truth)
  requireFinalExam: z.boolean().optional(),
  requireAssignments: z.boolean().optional(),
  requireAllRequiredAssessments: z.boolean().optional(),
});

export const grantAttemptSchema = z.object({
  reason: z.string().max(500).optional(),
  attemptsGranted: z.coerce.number().int().min(1).max(10).default(1),
});

export type AssessmentAcademicRulesFormValues = z.infer<typeof assessmentAcademicRulesSchema>;
export type CourseAcademicPolicyFormValues = z.infer<typeof courseAcademicPolicySchema>;
export type GrantAttemptFormValues = z.infer<typeof grantAttemptSchema>;
