'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateLecturer,
  getLecturer,
  inviteLecturer,
  listLecturerDepartments,
  listLecturers,
  updateLecturerStatus,
  verifyLecturerInvitation,
} from '@/api/lecturer.api';
import type {
  ActivateLecturerPayload,
  InviteLecturerPayload,
  LecturerDepartment,
  LecturerDetail,
  LecturerListItem,
  ListLecturersQuery,
} from '@/types/lecturer.types';
import { UserStatus } from '@/types/enum';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const lecturerQueryKeys = {
  list: (params?: ListLecturersQuery) => ['lecturers', params ?? {}] as const,
  detail: (id: string) => ['lecturers', 'detail', id] as const,
  departments: ['lecturers', 'departments'] as const,
};

export function useLecturersList(params?: ListLecturersQuery, enabled = true) {
  return useQuery({
    queryKey: lecturerQueryKeys.list(params),
    queryFn: () => listLecturers(params),
    enabled,
  });
}

export function useLecturerDepartments(enabled = true) {
  return useQuery<LecturerDepartment[]>({
    queryKey: lecturerQueryKeys.departments,
    queryFn: () => listLecturerDepartments(),
    enabled,
  });
}

export function useLecturerDetail(lecturerId: string, enabled = true) {
  return useQuery<LecturerDetail>({
    queryKey: lecturerQueryKeys.detail(lecturerId),
    queryFn: () => getLecturer(lecturerId),
    enabled: Boolean(lecturerId) && enabled,
  });
}

export function useInviteLecturer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteLecturerPayload) => inviteLecturer(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to send invitation.'));
    },
  });
}

export function useUpdateLecturerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lecturerId,
      status,
    }: {
      lecturerId: string;
      status: UserStatus.ACTIVE | UserStatus.INACTIVE;
    }) => updateLecturerStatus(lecturerId, status),
    onSuccess: (response) => {
      toast.success(response.message || 'Lecturer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update lecturer status.'));
    },
  });
}

export function useVerifyLecturerInvitation(token: string, enabled = true) {
  return useQuery({
    queryKey: ['lecturers', 'invitation', token],
    queryFn: () => verifyLecturerInvitation(token),
    enabled: Boolean(token) && enabled,
    select: (response) => response.data,
    retry: false,
  });
}

export function useActivateLecturer() {
  return useMutation({
    mutationFn: (payload: ActivateLecturerPayload) => activateLecturer(payload),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to activate account.'));
    },
  });
}
