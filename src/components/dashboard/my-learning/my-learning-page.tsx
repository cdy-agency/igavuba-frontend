'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { RoleGuard } from '@/guards/role-guard';
import { useMyProgress } from '@/hooks/use-progress';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { MyCourseProgressItem } from '@/types/progress';
import { UserRole } from '@/types/enum';
import { formatCatalogDuration } from '@/lib/catalog-utils';
import { cn } from '@/lib/utils';

function MyLearningContent() {
  const authReady = useAuthReady();
  const { data: progressItems = [], isPending, isError } = useMyProgress(authReady);

  if (!authReady || isPending) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-6 py-10 text-center">
        <p className="font-medium text-destructive">Unable to load your learning progress.</p>
      </div>
    );
  }

  if (progressItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">No enrolled courses yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the catalog and enroll in a course to start learning.
        </p>
        <Button asChild className="mt-6">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {progressItems.map((item: MyCourseProgressItem) => (
        <EnrolledCourseCard key={item.enrollmentId} item={item} />
      ))}
    </div>
  );
}

function EnrolledCourseCard({ item }: { item: MyCourseProgressItem }) {
  const durationLabel = formatCatalogDuration(item.estimatedHours);
  const progress = Math.round(item.percentage ?? 0);
  const continueHref = item.resumeContentId
    ? `/learn/${item.courseSlug}?contentId=${item.resumeContentId}`
    : `/learn/${item.courseSlug}`;
  const isCompleted = item.status === 'COMPLETED' || progress >= 100;

  return (
    <Link
      href={continueHref}
      className="group flex gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.courseTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-muted" />
        )}
        {isCompleted ? (
          <span className="absolute bottom-1 left-1 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Done
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-[11px] font-medium text-muted-foreground">
          {item.institution.name}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {item.courseTitle}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {durationLabel}
          </span>
          <span>
            {item.completedLessons}/{item.totalLessons} lessons
          </span>
        </div>

        <div className="mt-auto pt-2">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold tabular-nums text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isCompleted ? 'bg-emerald-500' : 'bg-primary',
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          {isCompleted ? 'Review course' : 'Continue'}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export function MyLearningPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.LEARNER]}>
      <div className="space-y-6">
        <PageHeader
          title="My Learning"
          description="Your enrolled courses and learning progress."
        />
        <MyLearningContent />
      </div>
    </RoleGuard>
  );
}
