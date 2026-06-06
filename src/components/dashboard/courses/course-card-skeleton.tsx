import { Skeleton } from '@/components/ui/skeleton';

export function CourseCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[85%]" />
          <Skeleton className="h-3 w-[55%]" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[75%]" />
        <div className="mt-auto flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
        </div>
      </div>
    </article>
  );
}

interface CourseCardsGridSkeletonProps {
  count?: number;
}

export function CourseCardsGridSkeleton({ count = 6 }: CourseCardsGridSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
