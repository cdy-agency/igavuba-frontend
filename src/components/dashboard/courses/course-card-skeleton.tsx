import { Skeleton } from '@/components/ui/skeleton';

export function CourseCardSkeleton() {
  return (
    <article className="flex flex-col gap-3 rounded border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-[45%]" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-[70%]" />
      <div className="flex gap-2 border-t border-border/60 pt-2.5">
        <Skeleton className="h-7 flex-1 rounded-md" />
        <Skeleton className="h-7 w-12 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
    </article>
  );
}

interface CourseCardsGridSkeletonProps {
  count?: number;
}

export function CourseCardsGridSkeleton({ count = 6 }: CourseCardsGridSkeletonProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
