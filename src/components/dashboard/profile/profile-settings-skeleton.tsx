'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-4 w-80 max-w-full rounded-full" />
      </div>

      <section className="space-y-5 rounded-lg border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </section>
    </div>
  );
}
