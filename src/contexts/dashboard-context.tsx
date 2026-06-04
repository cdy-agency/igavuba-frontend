'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { getNavigationForRole } from '@/config/navigation.config';
import { getPermissionsForRole } from '@/lib/permissions';
import { parseUserRole } from '@/lib/role-utils';
import type { DashboardContextValue, Institution } from '@/types/dashboard';

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  institution?: Institution | null;
}

export function DashboardProvider({
  children,
  institution = null,
}: DashboardProviderProps) {
  const { user, isLoading } = useAuth();
  const role = parseUserRole(user?.role);

  const value = useMemo<DashboardContextValue>(
    () => ({
      user,
      role,
      institution,
      navigation: getNavigationForRole(role),
      permissions: getPermissionsForRole(role),
      isLoading,
    }),
    [user, role, institution, isLoading],
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
