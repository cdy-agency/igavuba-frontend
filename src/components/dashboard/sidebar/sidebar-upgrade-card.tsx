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
      className="group flex items-center gap-2.5 rounded-lg bg-primary-subtle px-3 py-2.5 ring-1 ring-primary-muted/60 transition-all duration-150 hover:bg-primary-muted hover:ring-primary-muted"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Rocket className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="text-[13px] font-semibold leading-tight text-foreground">Upgrade plan</p>
        <p className="text-[11px] text-muted-foreground">Unlock all features</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-data-[collapsible=icon]:hidden" />
    </Link>
  );
}