import type { CreateInstitutionFormData } from '@/types/invitation.schema';
import type { InstitutionListItem } from '@/types/admin';
import type { PaginatedResponse } from '@/types/pagination';
import { apiClient } from './api-client';

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

export async function updateInstitutionActive(id: string, active: boolean) {
  const response = await apiClient.patch<UpdateInstitutionActiveResponse>(
    `/institutions/${id}/active`,
    { active },
  );
  return response.data;
}
