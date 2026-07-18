import type { CreateInstitutionFormData } from '@/types/invitation.schema';
import type {
  InstitutionDetail,
  InstitutionListItem,
  InviteInstitutionAdminPayload,
  UpdateInstitutionPayload,
} from '@/types/admin';
import type { PaginatedResponse } from '@/types/pagination';
import { apiClient } from './api-client';

export interface InstitutionMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateInstitutionResponse {
  success: boolean;
  message: string;
  data: {
    institution: {
      id: string;
      name: string;
      slug: string;
    };
    institutionAdmin: {
      id: string;
      email: string;
      status: string;
    };
  };
}

export interface UpdateInstitutionActiveResponse {
  success: boolean;
  message: string;
  data: InstitutionListItem;
}

export async function createInstitution(payload: CreateInstitutionFormData) {
  const response = await apiClient.post<CreateInstitutionResponse>(
    '/institutions',
    payload,
  );
  return response.data;
}

export async function listInstitutions(params?: Record<string, string | number>) {
  const response = await apiClient.get<PaginatedResponse<InstitutionListItem>>(
    '/institutions',
    { params },
  );
  return response.data;
}

export async function getInstitution(id: string) {
  const response = await apiClient.get<InstitutionMutationResponse<InstitutionDetail>>(
    `/institutions/${id}`,
  );
  return response.data.data;
}

export async function updateInstitution(id: string, payload: UpdateInstitutionPayload) {
  const response = await apiClient.patch<InstitutionMutationResponse<InstitutionDetail>>(
    `/institutions/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteInstitution(id: string) {
  const response = await apiClient.delete<InstitutionMutationResponse<{ id: string }>>(
    `/institutions/${id}`,
  );
  return response.data;
}

export async function inviteInstitutionAdmin(
  institutionId: string,
  payload: InviteInstitutionAdminPayload,
) {
  const response = await apiClient.post<
    InstitutionMutationResponse<{
      id: string;
      name: string | null;
      email: string;
      status: string;
    }>
  >(`/institutions/${institutionId}/admins`, payload);
  return response.data;
}

export async function removeInstitutionAdmin(institutionId: string, adminId: string) {
  const response = await apiClient.delete<InstitutionMutationResponse<{ id: string }>>(
    `/institutions/${institutionId}/admins/${adminId}`,
  );
  return response.data;
}

export async function updateInstitutionActive(id: string, active: boolean) {
  const response = await apiClient.patch<UpdateInstitutionActiveResponse>(
    `/institutions/${id}/active`,
    { active },
  );
  return response.data;
}
