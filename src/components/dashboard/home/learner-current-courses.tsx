'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useMyProgress } from '@/hooks/use-progress';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { formatCatalogDuration } from '@/lib/catalog-utils';
import { cn } from '@/lib/utils';

interface LearnerCurrentCoursesProps {
  className?: string;
}

export function LearnerCurrentCourses({ className }: LearnerCurrentCoursesProps) {
  const authReady = useAuthReady();
  const { data: courses = [], isPending } = useMyProgress(authReady);

  const displayCourses = [...courses]
    .sort((left, right) => {
      const leftDone = left.status === 'COMPLETED' || left.percentage >= 100;
      const rightDone = right.status === 'COMPLETED' || right.percentage >= 100;
      if (leftDone !== rightDone) return leftDone ? 1 : -1;
      return right.percentage - left.percentage;
    })
    .slice(0, 6);

  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">My current courses</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Pick up where you left off</p>
        </div>
        <Link href="/dashboard/my-learning" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {isPending ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center">
          <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No enrolled courses yet.</p>
          <Link href="/courses" className="mt-2 text-sm font-medium text-primary hover:underline">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory">
          {displayCourses.map((course) => {
            const progress = Math.min(100, Math.round(course.percentage ?? 0));
            const isCompleted = course.status === 'COMPLETED' || progress >= 100;
            const continueHref = course.resumeContentId
              ? `/learn/${course.courseSlug}?contentId=${course.resumeContentId}`
              : `/learn/${course.courseSlug}`;

            return (
              <Link
                key={course.enrollmentId}
                href={continueHref}
                className="group w-[240px] shrink-0 snap-start overflow-hidden border border-border/60 bg-background shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative h-32 w-full overflow-hidden bg-muted">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.courseTitle}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="220px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {isCompleted ? (
                    <span className="absolute left-0 top-0 bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Completed
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2.5 p-3">
                  <div>
                    <p className="truncate text-[10px] font-medium text-muted-foreground">
                      {course.institution.name}
                    </p>
                    <h4 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                      {course.courseTitle}
                    </h4>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {formatCatalogDuration(course.estimatedHours)} · {course.completedLessons}/
                    {course.totalLessons} lessons
                  </p>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold tabular-nums text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          isCompleted ? 'bg-emerald-500' : 'bg-primary',
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
                    {isCompleted ? 'Review course' : 'Continue learning'}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
