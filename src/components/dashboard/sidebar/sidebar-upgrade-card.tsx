'use client';

import Link from 'next/link';
import { ChevronRight, Rocket } from 'lucide-react';
import { useDashboard } from '@/contexts/dashboard-context';
import { DASHBOARD_HOME, getFooterNavigationForRole } from '@/config/navigation.config';

export function SidebarUpgradeCard() {
  const { role } = useDashboard();
  const footerNav = getFooterNavigationForRole(role);
  const upgradeHref = footerNav[0]?.href ?? DASHBOARD_HOME;

  return (
    <Link
      href={upgradeHref}
      className="group flex items-center gap-3 rounded-xl bg-primary-subtle p-3 ring-1 ring-primary-muted transition-colors hover:bg-primary-muted"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Rocket className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="text-sm font-semibold leading-tight text-foreground">Upgrade workspace</p>
        <p className="text-xs text-muted-foreground">Unlock all platform features</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
    </Link>
  );
}
