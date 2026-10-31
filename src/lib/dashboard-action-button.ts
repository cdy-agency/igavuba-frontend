import { cn } from '@/lib/utils';

export type DashboardActionVariant = 'default' | 'primary' | 'destructive';

export const dashboardActionIconClass = 'h-3 w-3';

/** Compact outline action buttons with icon + label (courses list). */
export function getDashboardLabeledActionButtonClass(
  variant: DashboardActionVariant = 'default',
) {
  return cn(
    '!h-7 shrink-0 !px-2.5 !text-xs font-medium',
    variant === 'default' &&
      '!border-border/80 !text-foreground hover:!bg-muted/50 hover:!text-foreground',
    variant === 'primary' &&
      '!border-primary/30 !text-primary hover:!bg-primary/5 hover:!text-primary',
    variant === 'destructive' &&
      '!border-destructive/30 !text-destructive hover:!bg-destructive/10 hover:!text-destructive',
  );
}

/** Compact icon-only outline action buttons used across dashboard tables and list rows. */
export function getDashboardActionButtonClass(variant: DashboardActionVariant = 'default') {
  return cn(
    '!h-7 !w-7 shrink-0 !p-0',
    variant === 'default' &&
      '!border-border/80 !text-foreground hover:!bg-muted/50 hover:!text-foreground',
    variant === 'primary' &&
      '!border-primary/30 !text-primary hover:!bg-primary/5 hover:!text-primary',
    variant === 'destructive' &&
      '!border-destructive/30 !text-destructive hover:!bg-destructive/10 hover:!text-destructive',
  );
}

export const dashboardActionGroupClass = 'flex shrink-0 flex-wrap items-center gap-2';
