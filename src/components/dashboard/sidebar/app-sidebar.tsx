'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useDashboard } from '@/contexts/dashboard-context';
import { getRoleLabel } from '@/lib/role-utils';
import {
  getFooterNavigationForRole,
  getNavigationGroupsForRole,
} from '@/config/navigation.config';
import { SidebarNavGroup } from '@/components/dashboard/sidebar/sidebar-nav-group';
import { SidebarNavLink } from '@/components/dashboard/sidebar/sidebar-nav-link';
import { SidebarUpgradeCard } from '@/components/dashboard/sidebar/sidebar-upgrade-card';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { PUBLIC_ROUTES } from '@/lib/routes';

const utilityLinks = [
  { title: 'Help center', href: PUBLIC_ROUTES.CONTACT, icon: HelpCircle },
  { title: 'Feedback', href: PUBLIC_ROUTES.CONTACT, icon: MessageSquare },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { institution, role } = useDashboard();
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const navGroups = getNavigationGroupsForRole(role);
  const footerNav = getFooterNavigationForRole(role);
  const collapsed = state === 'collapsed' && !isMobile;

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border p-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3 px-2 py-4">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              title="E-Learning"
            >
              <GraduationCap className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">E-Learning</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {institution?.name ?? 'Platform Workspace'}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Collapse sidebar"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                className="dashboard-sidebar-search cursor-text"
                aria-label="Search dashboard"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="gap-4 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <SidebarNavGroup key={group.id} group={group} />
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-sidebar-border p-4">
        {!collapsed ? (
          <>
            <ul className="flex flex-col gap-0.5">
              {utilityLinks.map((link) => (
                <SidebarNavLink
                  key={link.title}
                  href={link.href}
                  title={link.title}
                  icon={link.icon}
                  isActive={pathname === link.href}
                />
              ))}
              {footerNav.map((item) => (
                <SidebarNavLink
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  icon={item.icon}
                  isActive={isItemActive(item.href)}
                />
              ))}
            </ul>

            {/* <SidebarUpgradeCard /> */}

            {role ? (
              <p className="text-center text-[10px] text-muted-foreground">
                {getRoleLabel(role)} workspace
              </p>
            ) : null}
          </>
        ) : (
          <nav className="px-2">
            <ul className="flex flex-col gap-0.5">
              {[...utilityLinks, ...footerNav].map((item) => (
                <SidebarNavLink
                  key={item.title}
                  href={item.href}
                  title={item.title}
                  icon={item.icon}
                  isActive={isItemActive(item.href)}
                />
              ))}
            </ul>
          </nav>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
