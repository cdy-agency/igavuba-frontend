'use client';

import { cn } from '@/lib/utils';
import { CourseLifecycleStatus } from '@/types/course-status';

export type CourseStatusTab = 'ALL' | CourseLifecycleStatus;

export const COURSE_STATUS_TABS: { value: CourseStatusTab; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: CourseLifecycleStatus.DRAFT, label: 'Draft' },
  { value: CourseLifecycleStatus.PUBLISHED, label: 'Published' },
  { value: CourseLifecycleStatus.ARCHIVED, label: 'Archived' },
];

interface CourseStatusTabsProps {
  value: CourseStatusTab;
  onChange: (value: CourseStatusTab) => void;
  className?: string;
}

export function CourseStatusTabs({ value, onChange, className }: CourseStatusTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {COURSE_STATUS_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            value === tab.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
