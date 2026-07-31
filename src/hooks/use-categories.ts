'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '@/api/category.api';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const categoryQueryKeys = {
  all: ['categories'] as const,
  detail: (slugOrId: string) => ['categories', slugOrId] as const,
};

export function useCategoriesList(enabled = true) {
  return useQuery<Category[]>({
    queryKey: categoryQueryKeys.all,
    queryFn: getCategories,
    enabled,
  });
}

export function useCategoryDetail(slugOrId: string, enabled = true) {
  return useQuery({
    queryKey: categoryQueryKeys.detail(slugOrId),
    queryFn: () => getCategory(slugOrId),
    enabled: Boolean(slugOrId) && enabled,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Category created successfully.');
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create category.'));
    },
  });
}

export function useUpdateCategory(slugOrId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => updateCategory(slugOrId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Category updated successfully.');
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(slugOrId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update category.'));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slugOrId: string) => deleteCategory(slugOrId),
    onSuccess: (response) => {
      toast.success(response.message || 'Category deleted successfully.');
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete category.'));
    },
  });
}
