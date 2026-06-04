import type { LoginResponse } from '@/types';
import type {
  ActivationAccountStep1FormData,
  ActivationAccountStep2FormData,
} from '@/types/invitation.schema';
import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';

type PublicAuthConfig = AxiosRequestConfig & { skipAuthRefresh?: boolean };

export interface VerifyInvitationResponse {
  success: boolean;
  message: string;
  email: string;
  institutionName: string;
}

export async function verifyInvitationToken(token: string) {
  const response = await apiClient.get<VerifyInvitationResponse>(
    '/auth/invitation/verify',
    {
      params: { token },
      skipAuthRefresh: true,
    } as PublicAuthConfig,
  );
  return response.data;
}

export async function completeInvitation(
  token: string,
  step1: ActivationAccountStep1FormData,
  step2: ActivationAccountStep2FormData,
  logoFile?: File | null,
) {
  const formData = new FormData();
  formData.append('token', token);
  formData.append('name', step1.name);
  formData.append('password', step1.password);

  if (step2.website?.trim()) {
    formData.append('website', step2.website.trim());
  }
  if (step2.description?.trim()) {
    formData.append('description', step2.description.trim());
  }
  if (step2.contactPhone?.trim()) {
    formData.append('contactPhone', step2.contactPhone.trim());
  }
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  const response = await apiClient.post<LoginResponse>(
    '/auth/invitation/complete',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipAuthRefresh: true,
    } as PublicAuthConfig,
  );

  return response.data;
}
