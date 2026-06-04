import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
  accent?: 'blue' | 'emerald' | 'amber' | 'violet';
}

const accentStyles = {
  blue: 'from-primary-subtle to-primary-muted text-primary',
  emerald: 'from-emerald-50 to-emerald-100 text-emerald-600',
  amber: 'from-amber-50 to-amber-100 text-amber-600',
  violet: 'from-violet-50 to-violet-100 text-violet-600',
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
  accent = 'blue',
}: StatCardProps) {
  return (
    <div className={cn('dashboard-stat-card group', className)}>
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums md:text-[2rem]">
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner',
              accentStyles[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {(description || trend) && (
        <div className="relative mt-5 flex items-center justify-between gap-2 border-t border-border pt-4 text-sm">
          {description ? (
            <p className="text-muted-foreground">{description}</p>
          ) : (
            <span />
          )}
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                trend.positive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-destructive',
              )}
            >
              {trend.value}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
