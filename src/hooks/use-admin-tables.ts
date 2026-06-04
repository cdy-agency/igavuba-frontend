'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listInstitutions, updateInstitutionActive } from '@/api/institution.api';
import { listUsers, updateUserActive } from '@/api/user.api';
import type { ListQueryParams } from '@/types/admin';
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
  if (params.sort) record.sort = params.sort;
  return record;
}

export const adminQueryKeys = {
  institutions: (params: ListQueryParams) => ['institutions', params] as const,
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
