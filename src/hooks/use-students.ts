'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateStudent,
  confirmStudentImport,
  getStudent,
  importStudents,
  inviteStudent,
  listStudents,
  previewStudentImport,
  resetStudentPassword,
  updateStudent,
  updateStudentStatus,
  verifyStudentInvitation,
} from '@/api/student.api';
import type { ConfirmStudentImportPayload, InviteStudentPayload, ListStudentsQuery, StudentDetail, StudentImportPreview, StudentImportSummary, StudentListItem, UpdateStudentPayload } from '@/types/student.types';
import { UserStatus } from '@/types/enum';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const studentQueryKeys = {
  list: (params?: ListStudentsQuery) =>
    ['students', params?.searchq ?? '', params?.status ?? '', params?.departmentId ?? ''] as const,
  detail: (id: string) => ['students', 'detail', id] as const,
};

export function useStudentsList(params?: ListStudentsQuery, enabled = true) {
  return useQuery<StudentListItem[]>({
    queryKey: studentQueryKeys.list(params),
    queryFn: () => listStudents(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useStudent(studentId: string, enabled = true) {
  return useQuery<StudentDetail>({
    queryKey: studentQueryKeys.detail(studentId),
    queryFn: () => getStudent(studentId),
    enabled: Boolean(studentId) && enabled,
  });
}

export function useInviteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteStudentPayload) => inviteStudent(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Student invited successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to invite student.')),
  });
}

export function usePreviewStudentImport() {
  return useMutation({
    mutationFn: (file: File) => previewStudentImport(file),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to validate import file.')),
  });
}

export function useConfirmStudentImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfirmStudentImportPayload) => confirmStudentImport(payload),
    onSuccess: (response) => {
      if (
        response.data.failedInvitations > 0 ||
        response.data.skipped > 0
      ) {
        toast.warning(
          response.message ||
            'Some students could not be invited. Download the import report for details.',
        );
      } else {
        toast.success(response.message || 'Invitations sent successfully.');
      }
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to send invitations.')),
  });
}

export function useImportStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importStudents(file),
    onSuccess: (response) => {
      toast.success(response.message || 'Students imported successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to import students.')),
  });
}

export function useUpdateStudent(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStudentPayload) => updateStudent(studentId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Student updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to update student.')),
  });
}

export function useUpdateStudentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      status,
    }: {
      studentId: string;
      status: UserStatus.ACTIVE | UserStatus.INACTIVE;
    }) => updateStudentStatus(studentId, status),
    onSuccess: (response) => {
      toast.success(response.message || 'Student status updated.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to update student status.')),
  });
}

export function useResetStudentPassword() {
  return useMutation({
    mutationFn: (studentId: string) => resetStudentPassword(studentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Password reset email sent.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to reset password.')),
  });
}

export function useVerifyStudentInvitation(token: string, enabled = true) {
  return useQuery({
    queryKey: ['students', 'invitation', token],
    queryFn: () => verifyStudentInvitation(token),
    enabled: Boolean(token) && enabled,
    select: (response) => response.data,
    retry: false,
  });
}

export function useActivateStudent() {
  return useMutation({
    mutationFn: activateStudent,
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to activate account.')),
  });
}
