export interface CourseModule {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModulePayload {
  title: string;
  description?: string;
}

export type UpdateModulePayload = Partial<CreateModulePayload>;

export interface ModuleMutationResponse {
  success: boolean;
  message: string;
  data: CourseModule;
}

export interface ModuleDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string };
}

export interface ReorderModulesPayload {
  moduleIds: string[];
}

export interface ReorderModulesResponse {
  success: boolean;
  message: string;
  data: CourseModule[];
}
