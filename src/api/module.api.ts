import { apiClient } from './api-client';
import type {
  CourseModule,
  CreateModulePayload,
  ModuleDeleteResponse,
  ModuleMutationResponse,
  ReorderModulesPayload,
  ReorderModulesResponse,
  UpdateModulePayload,
} from '@/types/module';

export async function getCourseModules(courseId: string) {
  const response = await apiClient.get<CourseModule[]>(`/courses/${courseId}/modules`);
  return response.data;
}

export async function getModule(moduleId: string) {
  const response = await apiClient.get<ModuleMutationResponse>(`/modules/${moduleId}`);
  return response.data;
}

export async function createModule(courseId: string, payload: CreateModulePayload) {
  const response = await apiClient.post<ModuleMutationResponse>(
    `/courses/${courseId}/modules`,
    payload,
  );
  return response.data;
}

export async function updateModule(moduleId: string, payload: UpdateModulePayload) {
  const response = await apiClient.patch<ModuleMutationResponse>(
    `/modules/${moduleId}`,
    payload,
  );
  return response.data;
}

export async function deleteModule(moduleId: string) {
  const response = await apiClient.delete<ModuleDeleteResponse>(`/modules/${moduleId}`);
  return response.data;
}

export async function reorderModules(courseId: string, payload: ReorderModulesPayload) {
  const response = await apiClient.patch<ReorderModulesResponse>(
    `/courses/${courseId}/modules/reorder`,
    payload,
  );
  return response.data;
}
