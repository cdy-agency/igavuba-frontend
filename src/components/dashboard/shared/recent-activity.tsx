'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardActivityItem, DashboardRecentSection } from '@/types/dashboard.types';
import { EmptyState } from './empty-state';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  sections: DashboardRecentSection[];
  className?: string;
}

function ActivityRow({ item }: { item: DashboardActivityItem }) {
  const text = item.description
    ? `${item.title} — ${item.description}`
    : item.title;

  const row = (
    <div className="flex items-center gap-3 border-b border-border/40 py-3 last:border-0">
      <Clock className="h-4 w-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
      <p className="min-w-0 flex-1 text-sm text-foreground">{text}</p>
      <time className="shrink-0 text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
      </time>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block transition-colors hover:bg-muted/30">
        {row}
      </Link>
    );
  }

  return row;
}

function ActivityPanel({ section }: { section: DashboardRecentSection }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">{section.title}</h3>
      {section.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No {section.title.toLowerCase()} yet.
        </p>
      ) : (
        <div>
          {section.items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RecentActivity({ sections, className }: RecentActivityProps) {
  if (sections.length === 0) {
    return (
      <EmptyState
        title="No recent activity yet."
        description="Updates will show up here as users interact with the platform."
      />
    );
  }

  const primary =
    sections.find((section) => section.key === 'recentActivity') ?? sections[0];
  const secondary = sections.filter((section) => section.key !== primary.key);

  return (
    <div className={cn('space-y-4', className)}>
      {secondary.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {secondary.map((section) => (
            <ActivityPanel key={section.key} section={section} />
          ))}
        </div>
      ) : null}

      <ActivityPanel section={primary} />
    </div>
  );
}
