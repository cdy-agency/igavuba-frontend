import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';
import type {
  ActivateLecturerData,
  ActivateLecturerPayload,
  InviteLecturerPayload,
  LecturerDepartment,
  LecturerDetail,
  LecturerListItem,
  LecturerMutationResponse,
  ListLecturersQuery,
  VerifyLecturerInvitationData,
} from '@/types/lecturer.types';
import { UserStatus } from '@/types/enum';

type PublicAuthConfig = AxiosRequestConfig & { skipAuthRefresh?: boolean };

export async function inviteLecturer(payload: InviteLecturerPayload) {
  const response = await apiClient.post<
    LecturerMutationResponse<{ email: string; status: string }>
  >('/lecturers/invite', payload);
  return response.data;
}

export async function verifyLecturerInvitation(token: string) {
  const response = await apiClient.get<
    LecturerMutationResponse<VerifyLecturerInvitationData>
  >('/lecturers/invitation/verify', {
    params: { token },
    skipAuthRefresh: true,
  } as PublicAuthConfig);
  return response.data;
}

export async function activateLecturer(payload: ActivateLecturerPayload) {
  const response = await apiClient.post<
    LecturerMutationResponse<ActivateLecturerData>
  >('/lecturers/activate', payload, {
    skipAuthRefresh: true,
  } as PublicAuthConfig);
  return response.data;
}
export async function listLecturers(params?: ListLecturersQuery) {
  const response = await apiClient.get<LecturerMutationResponse<LecturerListItem[]>>(
    '/lecturers',
    { params },
  );
  return response.data.data;
}

export async function listLecturerDepartments() {
  const response = await apiClient.get<LecturerMutationResponse<LecturerDepartment[]>>(
    '/lecturers/departments',
  );
  return response.data.data;
}

export async function getLecturer(lecturerId: string) {
  const response = await apiClient.get<LecturerMutationResponse<LecturerDetail>>(
    `/lecturers/${lecturerId}`,
  );
  return response.data.data;
}

export async function updateLecturerStatus(
  lecturerId: string,
  status: UserStatus.ACTIVE | UserStatus.INACTIVE,
) {
  const response = await apiClient.patch<LecturerMutationResponse<LecturerListItem>>(
    `/lecturers/${lecturerId}/status`,
    { status },
  );
  return response.data;
}
