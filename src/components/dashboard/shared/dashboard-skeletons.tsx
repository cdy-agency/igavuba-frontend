'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface DashboardTableLoadingSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  showPagination?: boolean;
  showToolbar?: boolean;
}

export function DashboardTableLoadingSkeleton({
  columnCount = 6,
  rowCount = 4,
  showPagination = true,
  showToolbar = true,
}: DashboardTableLoadingSkeletonProps) {
  const tableSkeleton = (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-muted/25 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {Array.from({ length: columnCount }).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <Skeleton className="h-4 w-24 rounded-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 1 ? 'bg-primary/[0.03]' : 'bg-background'}
              >
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4">
                    <Skeleton className="h-4 w-full max-w-[10rem] rounded-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination ? (
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ) : null}
    </>
  );

  if (!showToolbar) {
    return tableSkeleton;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-[12.5rem] rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        {tableSkeleton}
      </div>
    </div>
  );
}

export function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-4 w-96 max-w-full rounded-full" />
      </div>

      <Skeleton className="h-12 w-full max-w-[18rem] rounded-full" />

      <div className="space-y-5 rounded-lg border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-4 w-96 max-w-full rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="mt-3 h-10 w-24 rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-[220px] w-full rounded-2xl" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-32 rounded-full" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-5/6 rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
