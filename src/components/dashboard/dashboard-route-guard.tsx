'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DASHBOARD_HOME, isRouteAllowedForRole } from '@/config/navigation.config';
import { useDashboard } from '@/contexts/dashboard-context';

interface DashboardRouteGuardProps {
  children: ReactNode;
}

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isLoading } = useDashboard();
  const isAllowed = isRouteAllowedForRole(pathname, role);

  useEffect(() => {
    if (isLoading || isAllowed) {
      return;
    }

    if (pathname !== DASHBOARD_HOME) {
      router.replace(DASHBOARD_HOME);
    }
  }, [pathname, role, isLoading, router, isAllowed]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
