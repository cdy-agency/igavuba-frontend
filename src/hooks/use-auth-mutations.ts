'use client';

import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';

export function useSignupMutation() {
  return useMutation({
    mutationFn: authApi.signup,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: authApi.resendVerification,
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

export function useVerifyResetOtpMutation() {
  return useMutation({
    mutationFn: authApi.verifyResetOtp,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}
