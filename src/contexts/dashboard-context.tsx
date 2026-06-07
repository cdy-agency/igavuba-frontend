'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAuth } from '@/lib/hooks/use-auth';
import { getNavigationForRole } from '@/config/navigation.config';
import { getPermissionsForRole } from '@/lib/permissions';
import { parseUserRole } from '@/lib/role-utils';
import type { DashboardContextValue, Institution } from '@/types/dashboard';

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

function mapInstitution(
  institution?: { id: string; name: string; slug: string } | null,
): Institution | null {
  if (!institution) {
    return null;
  }

  return {
    id: institution.id,
    name: institution.name,
    slug: institution.slug,
  };
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { user: authUser, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { data: meResponse, isPending: isMePending } = useCurrentUser(isAuthenticated);

  const profileUser = meResponse?.user ?? authUser;
  const role = parseUserRole(profileUser?.role);
  const institution = mapInstitution(profileUser?.institution ?? null);
  const isLoading = isAuthLoading || (isAuthenticated && isMePending && !meResponse);

  const value = useMemo<DashboardContextValue>(
    () => ({
      user: profileUser,
      role,
      institution,
      navigation: getNavigationForRole(role),
      permissions: getPermissionsForRole(role),
      isLoading,
    }),
    [profileUser, role, institution, isLoading],
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider.');
  }

  return context;
}
