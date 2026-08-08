'use client';

import { usePathname } from 'next/navigation';
import { DashboardNotificationsBell } from '@/components/dashboard/topbar/dashboard-notifications-bell';
import { DashboardBreadcrumbs } from '@/components/dashboard/dashboard-breadcrumbs';
import { DashboardSearch } from '@/components/dashboard/topbar/dashboard-search';
import { UserProfileDropdown } from '@/components/dashboard/user-profile-dropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DASHBOARD_HOME, getPageMeta } from '@/config/navigation.config';
import { cn } from '@/lib/utils';

export function DashboardTopbar() {
  const pathname = usePathname();
  const pageMeta = getPageMeta(pathname);
  const mobileTitle = pathname === DASHBOARD_HOME ? 'Dashboard' : pageMeta.title;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 shrink-0',
        'border-b border-border bg-white',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4 md:gap-3 md:px-6 lg:px-8">
        <SidebarTrigger className="h-9 w-9 shrink-0 md:hidden" />

        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground sm:hidden">
          {mobileTitle}
        </p>

        <div className="min-w-0 flex-1 hidden sm:block">
          <DashboardBreadcrumbs />
        </div>

        <DashboardSearch className="hidden w-full max-w-xs md:block md:max-w-sm lg:max-w-md md:ml-0 md:flex-1" />

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <DashboardNotificationsBell />
          <div className="hidden h-6 w-px bg-border sm:block" />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
}
