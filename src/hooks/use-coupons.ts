'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateCoupon,
  calculateCoupon,
  createCoupon,
  deactivateCoupon,
  deleteCoupon,
  generateCouponCode,
  getCoupon,
  getCouponUsage,
  listCoupons,
  updateCoupon,
  validateCoupon,
} from '@/api/coupon.api';
import type {
  CreateCouponPayload,
  UpdateCouponPayload,
  ValidateCouponPayload,
} from '@/types/coupon';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const couponQueryKeys = {
  list: (params?: Record<string, string | number>) => ['coupons', 'list', params] as const,
  detail: (id: string) => ['coupons', 'detail', id] as const,
  usage: (id: string) => ['coupons', 'usage', id] as const,
};

export function useCouponsList(params?: Record<string, string | number>, enabled = true) {
  return useQuery({
    queryKey: couponQueryKeys.list(params),
    queryFn: () => listCoupons(params),
    enabled,
  });
}

export function useCoupon(id: string, enabled = true) {
  return useQuery({
    queryKey: couponQueryKeys.detail(id),
    queryFn: () => getCoupon(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCouponUsage(id: string, enabled = true) {
  return useQuery({
    queryKey: couponQueryKeys.usage(id),
    queryFn: () => getCouponUsage(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => createCoupon(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Coupon created successfully.');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to create coupon.')),
  });
}

export function useUpdateCoupon(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCouponPayload) => updateCoupon(id, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Coupon updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to update coupon.')),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Coupon removed successfully.');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to delete coupon.')),
  });
}

export function useActivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateCoupon(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Coupon activated.');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to activate coupon.')),
  });
}

export function useDeactivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateCoupon(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Coupon deactivated.');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to deactivate coupon.')),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponPayload) => validateCoupon(payload),
  });
}

export function useCalculateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponPayload) => calculateCoupon(payload),
  });
}

export function useGenerateCouponCode() {
  return useMutation({
    mutationFn: (prefix?: string) => generateCouponCode(prefix),
  });
}
