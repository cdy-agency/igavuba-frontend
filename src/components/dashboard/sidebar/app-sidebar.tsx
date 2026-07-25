'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle, MessageSquare, PanelLeft, X } from 'lucide-react';
import { useDashboard } from '@/contexts/dashboard-context';
import {
  getFooterNavigationForRole,
  getPrimaryNavigationForRole,
} from '@/config/navigation.config';
import { SidebarNavLink } from '@/components/dashboard/sidebar/sidebar-nav-link';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import type { NavigationItem } from '@/types/dashboard';
import { PUBLIC_ROUTES } from '@/lib/routes';
import Image from 'next/image';

const utilityLinks: NavigationItem[] = [
  {
    title: 'Help',
    href: PUBLIC_ROUTES.CONTACT,
    icon: HelpCircle,
    roles: [],
  },
  {
    title: 'Feedback',
    href: PUBLIC_ROUTES.CONTACT,
    icon: MessageSquare,
    roles: [],
  },
];

function getLogoInitials(name?: string | null): string {
  if (!name) return 'EL';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function AppSidebar() {
  const pathname = usePathname();
  const { institution, role } = useDashboard();
  const { state, toggleSidebar, isMobile } = useSidebar();
  const navItems = getPrimaryNavigationForRole(role);
  const footerNav = getFooterNavigationForRole(role);
  const bottomItems = [...utilityLinks, ...footerNav];
  const collapsed = state === 'collapsed' && !isMobile;
  const logoInitials = getLogoInitials(institution?.name);

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="dashboard-rail-sidebar border-r-0 text-sidebar-foreground"
    >
      <SidebarHeader className="dashboard-rail-header shrink-0 p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="dashboard-rail-logo" title={institution?.name ?? 'Dashboard'}>
              {institution?.logo ? (
                <Image
                  src={institution.logo}
                  alt={institution.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="dashboard-rail-logo-text">{logoInitials}</span>
              )}
            </Link>
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sidebar-border bg-background text-sidebar-foreground shadow-sm transition hover:bg-sidebar-accent/10 sm:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar custom-scrollbar-dark min-h-0 flex-1 overflow-y-auto py-1 group-data-[collapsible=icon]:!overflow-y-auto">
        <nav className="flex w-full flex-col">
          <ul className="flex w-full flex-col">
            {navItems.map((item) => (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                isActive={isItemActive(item.href)}
                badge={item.badge}
              />
            ))}

            {bottomItems.length > 0 ? (
              <>
                <li
                  className="mx-2 my-1.5 border-t border-sidebar-border"
                  role="presentation"
                  aria-hidden="true"
                />
                {bottomItems.map((item) => (
                  <SidebarNavLink
                    key={`${item.href}-${item.title}`}
                    href={item.href}
                    title={item.title}
                    icon={item.icon}
                    isActive={isItemActive(item.href)}
                    badge={item.badge}
                  />
                ))}
              </>
            ) : null}
          </ul>
        </nav>
      </SidebarContent>

      <SidebarFooter className="shrink-0 border-t border-sidebar-border p-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="dashboard-rail-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <>
              <PanelLeft className="h-5 w-5" />
              <span className="dashboard-rail-nav-label">Menu</span>
            </>
          ) : (
            <>
              <X className="h-5 w-5" />
              <span className="dashboard-rail-nav-label">Close</span>
            </>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
