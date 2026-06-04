'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { DASHBOARD_HOME, getPageMeta } from '@/config/navigation.config';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const pageMeta = getPageMeta(pathname);
  const isHome = pathname === DASHBOARD_HOME;

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap gap-1 sm:gap-1.5">
        <BreadcrumbItem>
          <BreadcrumbLink
            asChild
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Link href={DASHBOARD_HOME} className="inline-flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {!isHome ? (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                {pageMeta.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
