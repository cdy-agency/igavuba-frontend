import type {
  ForgotPasswordDto,
  ForgotPasswordResponse,
  LoginDto,
  LoginResponse,
  RefreshTokenResponse,
  ResendVerificationDto,
  ResendVerificationResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  SignupDto,
  SignupResponse,
  VerifyEmailDto,
  VerifyEmailResponse,
  VerifyResetOtpDto,
  VerifyResetOtpResponse,
} from '@/types';
import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';

export const authApi = {
  async signup(payload: SignupDto) {
    const response = await apiClient.post<SignupResponse>('/auth/signup', payload);
    return response.data;
  },

  async login(payload: LoginDto) {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  async verifyEmail(payload: VerifyEmailDto) {
    const response = await apiClient.post<VerifyEmailResponse>('/auth/verify-email', payload);
    return response.data;
  },

  async resendVerification(payload: ResendVerificationDto) {
    const response = await apiClient.post<ResendVerificationResponse>(
      '/auth/resend-verification',
      payload,
    );
    return response.data;
  },

  async forgotPassword(payload: ForgotPasswordDto) {
    const response = await apiClient.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      payload,
    );
    return response.data;
  },

  async verifyResetOtp(payload: VerifyResetOtpDto) {
    const response = await apiClient.post<VerifyResetOtpResponse>(
      '/auth/verify-reset-otp',
      payload,
    );
    return response.data;
  },

  async resetPassword(payload: ResetPasswordDto) {
    const response = await apiClient.post<ResetPasswordResponse>(
      '/auth/reset-password',
      payload,
    );
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      { refreshToken },
      { skipAuthRefresh: true } as AxiosRequestConfig,
    );
    return response.data;
  },
};
