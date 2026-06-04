'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { getPageMeta, isRouteAllowedForRole } from '@/config/navigation.config';
import { useDashboard } from '@/contexts/dashboard-context';

interface DashboardStubPageProps {
  section: string;
}

export function DashboardStubPage({ section }: DashboardStubPageProps) {
  const pathname = `/dashboard/${section}`;
  const { role, isLoading } = useDashboard();
  const router = useRouter();
  const currentPath = usePathname();
  const pageMeta = getPageMeta(pathname);

  const isAllowed = isRouteAllowedForRole(currentPath, role);

  useEffect(() => {
    if (isLoading || isAllowed) {
      return;
    }

    router.replace('/dashboard');
  }, [currentPath, isLoading, role, router, isAllowed]);

  if (isLoading || !isAllowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title={pageMeta.title} description={pageMeta.description} />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
          <Construction className="h-7 w-7" />
        </div>
        <p className="text-lg font-semibold text-foreground">{pageMeta.title} module</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          This section is scaffolded and ready for feature implementation.
        </p>
      </div>
    </div>
  );
}
