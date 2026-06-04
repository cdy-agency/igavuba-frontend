'use client';

import type { CSSProperties, ReactNode } from 'react';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { AppSidebar } from '@/components/dashboard/sidebar/app-sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar/dashboard-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <SidebarProvider
        defaultOpen
        className="dashboard-shell min-h-svh"
        style={
          {
            '--sidebar-width': '17.5rem',
            '--sidebar-width-icon': '4.5rem',
          } as CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="dashboard-main-bg flex min-h-svh flex-col bg-background">
          <DashboardTopbar />
          <div className="flex flex-1 flex-col">
            <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
