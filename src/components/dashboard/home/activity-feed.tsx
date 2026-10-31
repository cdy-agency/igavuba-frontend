'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Send,
  UserPlus,
} from 'lucide-react';
import type { DashboardActivityItem } from '@/types/dashboard.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function activityIcon(type: string) {
  const normalized = type.toUpperCase();

  if (
    normalized.includes('COMPLET') ||
    normalized.includes('APPROVED') ||
    normalized.includes('CERTIFICATE') ||
    normalized.includes('GRADED')
  ) {
    return { Icon: CheckCircle2, className: 'bg-success/10 text-success' };
  }

  if (normalized.includes('REVIEW') || normalized.includes('WAITING')) {
    return { Icon: MessageSquare, className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
  }

  if (normalized.includes('ENROLL') || normalized.includes('INVIT')) {
    return { Icon: UserPlus, className: 'bg-primary/10 text-primary' };
  }

  if (normalized.includes('SUBMIT')) {
    return { Icon: Send, className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
  }

  return { Icon: BookOpen, className: 'bg-muted text-muted-foreground' };
}

interface ActivityFeedProps {
  items: DashboardActivityItem[];
  title?: string;
  emptyMessage?: string;
  className?: string;
  pageSize?: number;
}

export function ActivityFeed({
  items,
  title = 'Recent activity',
  emptyMessage = 'No recent activity yet.',
  className,
  pageSize = 4,
}: ActivityFeedProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items.length, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground">Latest updates and milestones</p>
        </div>
        {items.length > 0 ? (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
            {items.length} total
          </span>
        ) : null}
      </div>

      {visibleItems.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-border/50">
            {visibleItems.map((item) => {
              const { Icon, className: iconClass } = activityIcon(item.type);
              const content = (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                      iconClass,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium leading-snug text-foreground">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground/80">
                        {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
                      </span>
                    </div>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </>
              );

              return (
                <li key={item.id} className="py-2 first:pt-0 last:pb-0">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-start gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/40"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-2 px-1 py-0.5">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>

          {totalPages > 1 ? (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="mr-0.5 h-3.5 w-3.5" />
                Prev
              </Button>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Next
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
