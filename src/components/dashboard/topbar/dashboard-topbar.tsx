'use client';

import { Bell } from 'lucide-react';
import { DashboardBreadcrumbs } from '@/components/dashboard/dashboard-breadcrumbs';
import { UserProfileDropdown } from '@/components/dashboard/user-profile-dropdown';
import { SidebarCollapseTrigger, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardTopbar() {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 shrink-0',
        'border-b border-border bg-background',
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 md:px-6 lg:px-8">
        <SidebarTrigger className="h-9 w-9 rounded-lg border border-border bg-card text-foreground shadow-sm hover:bg-muted md:hidden" />
        <SidebarCollapseTrigger className="hidden h-9 w-9 rounded-lg border border-border bg-card text-foreground shadow-sm hover:bg-muted md:inline-flex" />

        <div className="min-w-0 flex-1">
          <DashboardBreadcrumbs />
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-[1.125rem] w-[1.125rem]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
}
