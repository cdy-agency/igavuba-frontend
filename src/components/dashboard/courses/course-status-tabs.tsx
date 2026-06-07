'use client';

import { cn } from '@/lib/utils';
import { CourseLifecycleStatus } from '@/types/course-status';
import type { CourseStatusCounts } from '@/hooks/use-course-status-counts';
import { getStatusCount } from '@/hooks/use-course-status-counts';

export type CourseStatusTab = 'ALL' | CourseLifecycleStatus;

interface StatusTabConfig {
  value: CourseStatusTab;
  label: string;
  inactiveClass: string;
  badgeClass: string;
  activeClass: string;
}

export const COURSE_STATUS_TABS: StatusTabConfig[] = [
  {
    value: 'ALL',
    label: 'All Courses',
    inactiveClass:
      'border-border bg-background text-foreground hover:border-primary/30',
    badgeClass: 'bg-primary/10 text-primary',
    activeClass: 'border-primary bg-primary/5 text-foreground shadow-sm',
  },
  {
    value: CourseLifecycleStatus.DRAFT,
    label: 'Draft',
    inactiveClass:
      'border-amber-500/20 bg-amber-500/5 text-amber-800 hover:border-amber-500/40 dark:text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    activeClass:
      'border-amber-500/50 bg-amber-500/10 text-amber-800 shadow-sm dark:text-amber-300',
  },
  {
    value: CourseLifecycleStatus.PUBLISHED,
    label: 'Published',
    inactiveClass:
      'border-success/20 bg-success/5 text-success hover:border-success/40',
    badgeClass: 'bg-success/15 text-success',
    activeClass: 'border-success/40 bg-success/10 text-success shadow-sm',
  },
  {
    value: CourseLifecycleStatus.ARCHIVED,
    label: 'Archived',
    inactiveClass:
      'border-border bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground',
    badgeClass: 'bg-muted text-muted-foreground',
    activeClass: 'border-border bg-muted/60 text-foreground shadow-sm',
  },
];

interface CourseStatusTabsProps {
  value: CourseStatusTab;
  onChange: (value: CourseStatusTab) => void;
  counts?: CourseStatusCounts;
  isLoadingCounts?: boolean;
  className?: string;
}

export function CourseStatusTabs({
  value,
  onChange,
  counts,
  isLoadingCounts,
  className,
}: CourseStatusTabsProps) {
  return (
    <div
      className={cn(
        '-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0',
        className,
      )}
    >
      {COURSE_STATUS_TABS.map((tab) => {
        const isActive = value === tab.value;
        const count = counts ? getStatusCount(tab.value, counts) : null;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              isActive ? tab.activeClass : tab.inactiveClass,
            )}
          >
            <span>{tab.label}</span>
            {isLoadingCounts ? (
              <span className="inline-flex h-4 min-w-4 animate-pulse rounded-full bg-muted" />
            ) : count !== null ? (
              <span
                className={cn(
                  'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none',
                  isActive && tab.value === 'ALL'
                    ? 'bg-primary text-primary-foreground'
                    : tab.badgeClass,
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
