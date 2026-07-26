import { apiClient } from './api-client';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  CreateDepartmentPayload,
  Department,
  DepartmentMutationResponse,
  ListDepartmentsQuery,
  UpdateDepartmentPayload,
} from '@/types/department.types';

export async function listDepartments(
  params?: ListDepartmentsQuery,
): Promise<PaginatedResponse<Department>> {
  const response = await apiClient.get<PaginatedResponse<Department>>(
    '/departments',
    { params },
  );
  return response.data;
}

export async function getDepartment(departmentId: string) {
  const response = await apiClient.get<DepartmentMutationResponse<Department>>(
    `/departments/${departmentId}`,
  );
  return response.data.data;
}

export async function getDepartmentBySlug(slug: string) {
  const response = await apiClient.get<DepartmentMutationResponse<Department>>(
    `/departments/slug/${slug}`,
  );
  return response.data.data;
}

export async function createDepartment(payload: CreateDepartmentPayload) {
  const response = await apiClient.post<DepartmentMutationResponse>(
    '/departments',
    payload,
  );
  return response.data;
}

export async function updateDepartment(
  departmentId: string,
  payload: UpdateDepartmentPayload,
) {
  const response = await apiClient.patch<DepartmentMutationResponse>(
    `/departments/${departmentId}`,
    payload,
  );
  return response.data;
}

export async function deleteDepartment(departmentId: string) {
  const response = await apiClient.delete<DepartmentMutationResponse<{ id: string }>>(
    `/departments/${departmentId}`,
  );
  return response.data;
}
