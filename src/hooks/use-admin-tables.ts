'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteInstitution,
  getInstitution,
  inviteInstitutionAdmin,
  listInstitutions,
  removeInstitutionAdmin,
  updateInstitution,
  updateInstitutionActive,
} from '@/api/institution.api';
import { listUsers, updateUserActive } from '@/api/user.api';
import type {
  InstitutionAdminSummary,
  InstitutionListItem,
  ListQueryParams,
  UpdateInstitutionPayload,
  InstitutionDetail,
  InviteInstitutionAdminPayload,
} from '@/types/admin';
import { UserRole } from '@/types/enum';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

function toQueryRecord(params: ListQueryParams): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  if (params.page) record.page = params.page;
  if (params.limit) record.limit = params.limit;
  if (params.searchq) record.searchq = params.searchq;
  if (params.role) record.role = params.role;
  if (params.status) record.status = params.status;
  if (params.learnerType) record.learnerType = params.learnerType;
  if (params.sort) record.sort = params.sort;
  return record;
}

export const adminQueryKeys = {
  institutions: (params: ListQueryParams) => ['institutions', params] as const,
  institutionDetail: (id: string) => ['institutions', 'detail', id] as const,
  users: (params: ListQueryParams) => ['users', params] as const,
  institutionAdmins: (params: ListQueryParams) =>
    ['users', { ...params, role: UserRole.INSTITUTION_ADMIN }] as const,
};

const listQueryOptions = {
  placeholderData: <T,>(previousData: T | undefined) => previousData,
};

export function useInstitutionsList(params: ListQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.institutions(params),
    queryFn: () => listInstitutions(toQueryRecord(params)),
    ...listQueryOptions,
  });
}

export function useInstitutionDetail(id: string, enabled = true) {
  return useQuery<InstitutionDetail>({
    queryKey: adminQueryKeys.institutionDetail(id),
    queryFn: () => getInstitution(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useUsersList(params: ListQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => listUsers(toQueryRecord(params)),
    ...listQueryOptions,
  });
}

export function useInstitutionAdminsList(params: ListQueryParams) {
  const withRole = { ...params, role: UserRole.INSTITUTION_ADMIN };
  return useQuery({
    queryKey: adminQueryKeys.institutionAdmins(params),
    queryFn: () => listUsers(toQueryRecord(withRole)),
    ...listQueryOptions,
  });
}

export function useUpdateInstitutionActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateInstitutionActive(id, active),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update institution'));
    },
  });
}

export function useUpdateInstitution(institutionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInstitutionPayload) =>
      updateInstitution(institutionId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Institution updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.institutionDetail(institutionId),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update institution'));
    },
  });
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInstitution(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Institution deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete institution'));
    },
  });
}

export function useInviteInstitutionAdmin(institutionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteInstitutionAdminPayload) =>
      inviteInstitutionAdmin(institutionId, payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Institution admin invited successfully.');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.institutionDetail(institutionId),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to invite admin'));
    },
  });
}

export function useRemoveInstitutionAdmin(institutionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId: string) => removeInstitutionAdmin(institutionId, adminId),
    onSuccess: (response) => {
      toast.success(response.message || 'Institution admin removed successfully.');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.institutionDetail(institutionId),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove admin'));
    },
  });
}

export function useUpdateUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateUserActive(id, active),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update user'));
    },
  });
}
