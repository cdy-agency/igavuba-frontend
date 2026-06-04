import { z } from 'zod';

export const activationAccountStep1Schema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const activationAccountStep2Schema = z.object({
  website: z.union([z.string().url('Please enter a valid URL'), z.literal('')]).optional(),
  description: z.string().max(2000, 'Description is too long').optional(),
  contactPhone: z.string().max(30, 'Phone number is too long').optional(),
});

export const createInstitutionSchema = z.object({
  name: z.string().min(2, 'Institution name is required').max(200),
  adminEmail: z.string().email('Please enter a valid admin email'),
});

export type ActivationAccountStep1FormData = z.infer<typeof activationAccountStep1Schema>;
export type ActivationAccountStep2FormData = z.infer<typeof activationAccountStep2Schema>;
export type CreateInstitutionFormData = z.infer<typeof createInstitutionSchema>;
