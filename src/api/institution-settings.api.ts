import { apiClient } from './api-client';
import type {
  InstitutionSettingsResponse,
  UpdateInstitutionSettingsPayload,
} from '@/types/institution-settings.types';

export async function getInstitutionSettings() {
  const response = await apiClient.get<InstitutionSettingsResponse>('/institution-settings');
  return response.data;
}

export async function updateInstitutionSettings(payload: UpdateInstitutionSettingsPayload) {
  const response = await apiClient.patch<InstitutionSettingsResponse>(
    '/institution-settings',
    payload,
  );
  return response.data;
}
