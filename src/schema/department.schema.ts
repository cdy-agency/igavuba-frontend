import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, 'Department name is required').max(120),
});

export const updateDepartmentSchema = createDepartmentSchema;

export type CreateDepartmentFormValues = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentFormValues = z.infer<typeof updateDepartmentSchema>;
