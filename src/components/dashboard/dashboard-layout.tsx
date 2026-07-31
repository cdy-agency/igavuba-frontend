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
        className="dashboard-shell min-h-svh w-full"
        style={
          {
            '--sidebar-width': '7rem',
            '--sidebar-width-icon': '3.75rem',
          } as CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="dashboard-main-bg flex min-h-svh min-w-0 w-full flex-1 flex-col bg-background transition-[margin,width] duration-200 ease-linear">
          <DashboardTopbar />
          <div className="custom-scrollbar custom-scrollbar-light flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto w-full max-w-full flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:max-w-[1600px]">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
