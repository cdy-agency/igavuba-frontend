import apiClient from './api-client';
import type {
  PaymentDetailResponse,
  PaymentMutationResponse,
  PaymentsListResponse,
  RejectPaymentPayload,
  SubmitPaymentPayload,
} from '@/types/payment';

export async function submitPayment(payload: SubmitPaymentPayload) {
  const response = await apiClient.post<PaymentMutationResponse>('/payments', payload);
  return response.data;
}

export async function getMyPayments() {
  const response = await apiClient.get<PaymentsListResponse>('/payments/my');
  return response.data.data;
}

export async function getInstitutionPayments() {
  const response = await apiClient.get<PaymentsListResponse>('/payments');
  return response.data.data;
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
