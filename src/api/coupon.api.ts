import { apiClient } from './api-client';
import type {
  CouponListResponse,
  CouponMutationResponse,
  CouponRecord,
  CouponUsageRecord,
  CouponValidationResult,
  CreateCouponPayload,
  UpdateCouponPayload,
  ValidateCouponPayload,
} from '@/types/coupon';

export async function listCoupons(params?: Record<string, string | number>) {
  const response = await apiClient.get<CouponListResponse>('/coupons', { params });
  return response.data;
}

export async function getCoupon(id: string) {
  const response = await apiClient.get<CouponMutationResponse>(`/coupons/${id}`);
  return response.data;
}

export async function createCoupon(payload: CreateCouponPayload) {
  const response = await apiClient.post<CouponMutationResponse>('/coupons', payload);
  return response.data;
}

export async function updateCoupon(id: string, payload: UpdateCouponPayload) {
  const response = await apiClient.patch<CouponMutationResponse>(`/coupons/${id}`, payload);
  return response.data;
}

export async function deleteCoupon(id: string) {
  const response = await apiClient.delete<CouponMutationResponse>(`/coupons/${id}`);
  return response.data;
}

export async function activateCoupon(id: string) {
  const response = await apiClient.post<CouponMutationResponse>(`/coupons/${id}/activate`);
  return response.data;
}

export async function deactivateCoupon(id: string) {
  const response = await apiClient.post<CouponMutationResponse>(`/coupons/${id}/deactivate`);
  return response.data;
}

export async function getCouponUsage(id: string) {
  const response = await apiClient.get<{ success: boolean; data: CouponUsageRecord[] }>(
    `/coupons/${id}/usage`,
  );
  return response.data;
}

export async function validateCoupon(payload: ValidateCouponPayload) {
  const response = await apiClient.post<{ success: boolean; data: CouponValidationResult; message: string }>(
    '/coupons/validate',
    payload,
  );
  return response.data;
}

export async function calculateCoupon(payload: ValidateCouponPayload) {
  const response = await apiClient.post<{ success: boolean; data: CouponValidationResult; message: string }>(
    '/coupons/calculate',
    payload,
  );
  return response.data;
}

export async function generateCouponCode(prefix?: string) {
  const response = await apiClient.post<CouponMutationResponse<{ code: string }>>(
    '/coupons/generate-code',
    { prefix },
  );
  return response.data;
}
