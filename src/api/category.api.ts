import { apiClient } from './api-client';
import { publicApiClient } from './public-api-client';
import type {
  Category,
  CategoryMutationResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category';

export async function getCategories() {
  const response = await publicApiClient.get<{ data: Category[] }>('/categories');
  return response.data.data;
}

export async function getCategory(slugOrId: string) {
  const response = await publicApiClient.get<{ data: Category }>(
    `/categories/${slugOrId}`,
  );
  return response.data.data;
}

export async function createCategory(payload: CreateCategoryPayload) {
  const response = await apiClient.post<CategoryMutationResponse>('/categories', payload);
  return response.data;
}

export async function updateCategory(slugOrId: string, payload: UpdateCategoryPayload) {
  const response = await apiClient.patch<CategoryMutationResponse>(
    `/categories/${slugOrId}`,
    payload,
  );
  return response.data;
}

export async function deleteCategory(slugOrId: string) {
  const response = await apiClient.delete<CategoryMutationResponse>(
    `/categories/${slugOrId}`,
  );
  return response.data;
}
