'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartmentBySlug,
  listDepartments,
  updateDepartment,
} from '@/api/department.api';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  CreateDepartmentPayload,
  Department,
  ListDepartmentsQuery,
  UpdateDepartmentPayload,
} from '@/types/department.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const departmentQueryKeys = {
  list: (params?: ListDepartmentsQuery) => ['departments', params ?? {}] as const,
  detail: (id: string) => ['departments', 'detail', id] as const,
};

export function useDepartmentsList(
  params?: ListDepartmentsQuery,
  enabled = true,
) {
  return useQuery<PaginatedResponse<Department>>({
    queryKey: departmentQueryKeys.list(params),
    queryFn: () => listDepartments(params),
    enabled,
  });
}

export function useDepartmentDetail(departmentId: string, enabled = true) {
  return useQuery<Department>({
    queryKey: departmentQueryKeys.detail(departmentId),
    queryFn: () => getDepartment(departmentId),
    enabled: Boolean(departmentId) && enabled,
  });
}

export function useDepartmentDetailBySlug(slug: string, enabled = true) {
  return useQuery<Department>({
    queryKey: departmentQueryKeys.detail(slug),
    queryFn: () => getDepartmentBySlug(slug),
    enabled: Boolean(slug) && enabled,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => createDepartment(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Department created successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers', 'departments'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create department.'));
    },
  });
}

export function useUpdateDepartment(departmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDepartmentPayload) =>
      updateDepartment(departmentId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Department updated successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.detail(departmentId) });
      queryClient.invalidateQueries({ queryKey: ['lecturers', 'departments'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update department.'));
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: string) => deleteDepartment(departmentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Department deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers', 'departments'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete department.'));
    },
  });
}
