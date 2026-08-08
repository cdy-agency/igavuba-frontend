import { apiClient } from './api-client';
import type {
  WishlistCheckResponse,
  WishlistItem,
  WishlistListResponse,
} from '@/types/wishlist.types';

export async function getWishlist(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) {
  const response = await apiClient.get<{
    success: boolean;
    data: WishlistItem[];
    pagination: WishlistListResponse['pagination'];
  }>('/wishlist', { params });

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  } satisfies WishlistListResponse;
}

export async function checkWishlist(courseId: string) {
  const response = await apiClient.get<{
    success: boolean;
    data: WishlistCheckResponse;
  }>(`/wishlist/check/${courseId}`);
  return response.data.data;
}

export async function addToWishlist(courseId: string) {
  const response = await apiClient.post<{
    success: boolean;
    data: WishlistItem;
    message: string;
  }>(`/wishlist/${courseId}`);
  return response.data;
}

export async function removeFromWishlist(courseId: string) {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
  }>(`/wishlist/${courseId}`);
  return response.data;
}
