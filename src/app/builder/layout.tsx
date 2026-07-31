'use client';

import type { ReactNode } from 'react';
import { DashboardProvider } from '@/contexts/dashboard-context';

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <div className="course-builder-layout-shell flex h-svh min-h-0 flex-col overflow-hidden">
        {children}
      </div>
    </DashboardProvider>
  );
}
