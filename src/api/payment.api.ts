import apiClient from './api-client';
import type {
  PaymentDetailResponse,
  PaymentMutationResponse,
  PaymentsListResponse,
  RejectPaymentPayload,
  SubmitPaymentPayload,
  PaymentRecord,
} from '@/types/payment';
import type { PaginatedResponse } from '@/types/pagination';

export async function submitPayment(payload: SubmitPaymentPayload) {
  const response = await apiClient.post<PaymentMutationResponse>('/payments', payload);
  return response.data;
}

export async function getMyPayments() {
  const response = await apiClient.get<{ data: PaymentRecord[] }>('/payments/my');
  return response.data.data;
}

export async function getInstitutionPayments(params: Record<string, string | number> = {}) {
  const response = await apiClient.get<PaymentsListResponse>('/payments', {
    params,
  });
  return response.data;
}

export async function getPaymentById(id: string) {
  const response = await apiClient.get<PaymentDetailResponse>(`/payments/${id}`);
  return response.data.data;
}

export async function approvePayment(id: string) {
  const response = await apiClient.patch<PaymentMutationResponse>(`/payments/${id}/approve`);
  return response.data;
}

export async function rejectPayment(id: string, payload: RejectPaymentPayload) {
  const response = await apiClient.patch<PaymentMutationResponse>(
    `/payments/${id}/reject`,
    payload,
  );
  return response.data;
}
