import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';
import type {
  ActivateStudentData,
  ActivateStudentPayload,
  InviteStudentPayload,
  ListStudentsQuery,
  StudentDetail,
  StudentImportSummary,
  StudentImportPreview,
  ConfirmStudentImportPayload,
  StudentListItem,
  StudentMutationResponse,
  UpdateStudentPayload,
  VerifyStudentInvitationData,
} from '@/types/student.types';
import { UserStatus } from '@/types/enum';

type PublicAuthConfig = AxiosRequestConfig & { skipAuthRefresh?: boolean };

export async function inviteStudent(payload: InviteStudentPayload) {
  const response = await apiClient.post<
    StudentMutationResponse<{ email: string; status: string }>
  >('/students/invite', payload);
  return response.data;
}

export async function previewStudentImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<StudentMutationResponse<StudentImportPreview>>(
    '/students/import/preview',
    formData,
  );
  return response.data;
}

export async function confirmStudentImport(payload: ConfirmStudentImportPayload) {
  const response = await apiClient.post<StudentMutationResponse<StudentImportSummary>>(
    '/students/import/confirm',
    payload,
  );
  return response.data;
}

export async function importStudents(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<StudentMutationResponse<StudentImportSummary>>(
    '/students/import',
    formData,
  );
  return response.data;
}

export async function downloadStudentImportTemplate() {
  const response = await apiClient.get<string>('/students/import/template', {
    responseType: 'text',
  });
  return response.data;
}

export async function verifyStudentInvitation(token: string) {
  const response = await apiClient.get<
    StudentMutationResponse<VerifyStudentInvitationData>
  >('/students/invitation/verify', {
    params: { token },
    skipAuthRefresh: true,
  } as PublicAuthConfig);
  return response.data;
}

export async function activateStudent(payload: ActivateStudentPayload) {
  const response = await apiClient.post<StudentMutationResponse<ActivateStudentData>>(
    '/students/activate',
    payload,
    { skipAuthRefresh: true } as PublicAuthConfig,
  );
  return response.data;
}

export async function listStudents(params?: ListStudentsQuery): Promise<StudentListItem[]> {
  const response = await apiClient.get<StudentMutationResponse<StudentListItem[]>>(
    '/students',
    { params },
  );
  return response.data.data;
}

export async function getStudent(studentId: string) {
  const response = await apiClient.get<StudentMutationResponse<StudentDetail>>(
    `/students/${studentId}`,
  );
  return response.data.data;
}

export async function updateStudent(studentId: string, payload: UpdateStudentPayload) {
  const response = await apiClient.patch<StudentMutationResponse<StudentDetail>>(
    `/students/${studentId}`,
    payload,
  );
  return response.data;
}

export async function updateStudentStatus(
  studentId: string,
  status: UserStatus.ACTIVE | UserStatus.INACTIVE,
) {
  const response = await apiClient.patch<StudentMutationResponse<{ id: string; status: string }>>(
    `/students/${studentId}/status`,
    { status },
  );
  return response.data;
}

export async function resetStudentPassword(studentId: string) {
  const response = await apiClient.post<StudentMutationResponse<{ email: string }>>(
    `/students/${studentId}/reset-password`,
  );
  return response.data;
}

export async function cancelStudentInvitation(email: string) {
  const response = await apiClient.delete<StudentMutationResponse<{ email: string }>>(
    `/students/invitation`,
    { params: { email } },
  );
  return response.data;
}
