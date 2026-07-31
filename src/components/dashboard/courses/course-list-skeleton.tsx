import { Skeleton } from '@/components/ui/skeleton';

export function CourseListItemSkeleton() {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5">
      <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center sm:gap-4">
        <Skeleton className="h-14 w-[4.5rem] shrink-0 rounded" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-[55%]" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-[80%]" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 sm:shrink-0 sm:border-0 sm:pt-0">
        <Skeleton className="h-6 w-20 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14 rounded-md" />
          <Skeleton className="h-7 w-14 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </article>
  );
}

interface CourseListSkeletonProps {
  count?: number;
}

export function CourseListSkeleton({ count = 6 }: CourseListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <CourseListItemSkeleton key={index} />
      ))}
    </div>
  );
}
