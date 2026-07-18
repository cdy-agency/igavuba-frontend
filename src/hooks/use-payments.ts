'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approvePayment,
  getInstitutionPayments,
  getMyPayments,
  getPaymentById,
  rejectPayment,
  submitPayment,
} from '@/api/payment.api';
import type { RejectPaymentPayload, SubmitPaymentPayload } from '@/types/payment';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const paymentQueryKeys = {
  my: ['payments', 'my'] as const,
  institution: ['payments', 'institution'] as const,
  detail: (id: string) => ['payments', 'detail', id] as const,
};

export function useMyPayments(
  enabled = true,
  options?: { refetchOnMount?: boolean | 'always' },
) {
  const refetchOnMount = options?.refetchOnMount ?? true;

  return useQuery({
    queryKey: paymentQueryKeys.my,
    queryFn: getMyPayments,
    enabled,
    staleTime: refetchOnMount === 'always' ? 0 : 30_000,
    refetchOnMount,
  });
}

export function useInstitutionPayments(enabled = true) {
  return useQuery({
    queryKey: paymentQueryKeys.institution,
    queryFn: getInstitutionPayments,
    enabled,
  });
}

export function usePayment(id: string, enabled = true) {
  return useQuery({
    queryKey: paymentQueryKeys.detail(id),
    queryFn: () => getPaymentById(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitPaymentPayload) => submitPayment(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Payment proof uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['learning'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to submit payment proof.'));
    },
  });
}

export function useApprovePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvePayment(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Payment approved successfully.');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['learning'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to approve payment.'));
    },
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectPaymentPayload }) =>
      rejectPayment(id, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Payment rejected successfully.');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to reject payment.'));
    },
  });
}
