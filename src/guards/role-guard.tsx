'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DASHBOARD_HOME } from '@/config/navigation.config';
import { useDashboard } from '@/contexts/dashboard-context';
import { hasAnyRole } from '@/lib/role-utils';
import { UserRole } from '@/types/enum';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackHref?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackHref = DASHBOARD_HOME,
}: RoleGuardProps) {
  const { role, isLoading } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  const isAllowed = hasAnyRole(role, allowedRoles);

  useEffect(() => {
    if (isLoading || isAllowed) {
      return;
    }

    if (pathname !== fallbackHref) {
      router.replace(fallbackHref);
    }
  }, [isAllowed, isLoading, pathname, router, fallbackHref]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
