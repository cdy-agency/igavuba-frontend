'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function OazisDashboardSkeleton() {
  return (
    <div className="-m-4 bg-[#eef3f6] p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-7">
      <div className="mx-auto max-w-[1320px] space-y-5">
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-[#e6edf1] pb-4">
          <Skeleton className="h-10 w-56 rounded-[11px]" />
          <Skeleton className="h-10 w-40 rounded-[11px]" />
          <Skeleton className="h-10 w-36 rounded-[11px]" />
        </div>

        <Skeleton className="h-52 w-full rounded-[26px]" />

        <div className="rounded-[20px] border border-[#e6edf1] bg-white p-7 shadow-sm">
          <Skeleton className="h-7 w-72 rounded-full" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full rounded-full" />
          <div className="mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-36 rounded-[11px]" />
            ))}
          </div>
          <Skeleton className="mt-6 h-[300px] w-full rounded-2xl" />
        </div>

        <div className="grid gap-[18px] xl:grid-cols-[1.4fr_1fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[20px] border border-[#e6edf1] bg-white p-5 shadow-sm"
            >
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="mt-2 h-4 w-56 rounded-full" />
              <Skeleton className="mt-5 h-[200px] w-full rounded-2xl" />
            </div>
          ))}
        </div>

        <div className="rounded-[20px] border border-[#e6edf1] bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-64 rounded-full" />
          <Skeleton className="mt-4 h-10 w-full max-w-xl rounded-full" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[230px_1fr]">
            <Skeleton className="h-[230px] w-full rounded-full" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-full rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-[18px] xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[20px] border border-[#e6edf1] bg-white p-5 shadow-sm"
            >
              <Skeleton className="h-5 w-44 rounded-full" />
              <Skeleton className="mt-2 h-4 w-36 rounded-full" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 4 }).map((_, row) => (
                  <div key={row} className="flex gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-[10px]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-3 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
