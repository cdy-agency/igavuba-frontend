'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingItem {
  label: string;
  value: number;
  href?: string;
  tone?: 'warning' | 'info' | 'danger';
}

interface PendingSummaryCardProps {
  title?: string;
  items: PendingItem[];
  className?: string;
}

const TONE_CLASS = {
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-primary',
  danger: 'text-destructive',
};

export function PendingSummaryCard({
  title = 'Needs attention',
  items,
  className,
}: PendingSummaryCardProps) {
  const visibleItems = items.filter((item) => item.value > 0);

  if (visibleItems.length === 0) return null;

  return (
    <section
      className={cn(
        'rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {visibleItems.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/80 px-3 py-2.5 text-sm transition-colors hover:bg-card"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className={TONE_CLASS[item.tone ?? 'warning']}>{item.value}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/80 px-3 py-2.5 text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={cn('font-semibold', TONE_CLASS[item.tone ?? 'warning'])}>
                  {item.value}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
