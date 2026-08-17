'use client';

import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function getPersonInitials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function ModernTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModernTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  filterCount = 0,
  onClearFilters,
  sort,
  actions,
}: {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  filterCount?: number;
  onClearFilters?: () => void;
  sort?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const hasSearch = onSearchChange !== undefined && searchValue !== undefined;
  const hasMeta = (filterCount > 0 && onClearFilters) || sort || actions;

  return (
    <div className="border-b border-border/70 px-4 py-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {hasSearch ? (
            <div className="relative w-[220px] shrink-0 sm:w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 border-border/80 bg-background pl-9 text-sm shadow-none"
              />
            </div>
          ) : null}
          {filters ? (
            <div className="flex shrink-0 items-center gap-2">{filters}</div>
          ) : null}
        </div>

        {hasMeta ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-2">
            {filterCount > 0 && onClearFilters ? (
              <p className="whitespace-nowrap text-xs text-muted-foreground">
                {filterCount} filter{filterCount === 1 ? '' : 's'} applied{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={onClearFilters}
                >
                  Clear all
                </button>
              </p>
            ) : null}
            {sort}
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ModernFilterSelect({
  icon: Icon,
  label,
  value,
  onValueChange,
  options,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          'h-9 w-auto min-w-[9.5rem] max-w-[11.5rem] shrink-0 gap-1.5 border-border/80 bg-background px-2.5 text-sm font-normal shadow-none [&>span]:line-clamp-none',
          className,
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex min-w-0 items-center gap-1 truncate text-left">
          <span className="shrink-0 text-muted-foreground">{label}:</span>
          <SelectValue placeholder={label} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ModernPersonCell({
  name,
  email,
  subtitle,
  profileImage,
  onClick,
}: {
  name: string | null;
  email: string;
  subtitle?: string | null;
  profileImage?: string | null;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Avatar className="h-10 w-10 shrink-0 border border-border/60">
        {profileImage ? <AvatarImage src={profileImage} alt={name ?? email} /> : null}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {getPersonInitials(name, email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{name?.trim() || 'Unnamed user'}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle ?? email}</p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-[12rem] items-center gap-3 text-left transition-colors hover:text-primary"
      >
        {content}
      </button>
    );
  }

  return <div className="flex min-w-[12rem] items-center gap-3">{content}</div>;
}

type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  danger: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-border bg-muted/50 text-muted-foreground',
};

export function ModernStatusBadge({
  label,
  tone = 'neutral',
  icon: Icon,
}: {
  label: string;
  tone?: StatusTone;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        STATUS_TONE_CLASS[tone],
      )}
    >
      {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
      {label}
    </span>
  );
}

export function ModernProgressCell({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tone =
    clamped >= 100 ? 'bg-emerald-500' : clamped >= 50 ? 'bg-primary' : 'bg-muted-foreground/40';

  return (
    <div className="min-w-[120px] space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-foreground">{clamped}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${clamped}%` }} />
      </div>
      {label ? <p className="text-[11px] text-muted-foreground">{label}</p> : null}
    </div>
  );
}

export function ModernTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function ModernTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border/70 bg-muted/20 text-left">
      <tr>{children}</tr>
    </thead>
  );
}

export function ModernTableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function ModernTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function ModernTableRow({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        'border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/20',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function ModernTableCell({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}) {
  return (
    <td className={cn('px-4 py-4 align-middle', className)} onClick={onClick}>
      {children}
    </td>
  );
}

export function ModernTableEmpty({ message }: { message: string }) {
  return (
    <div className="px-6 py-16 text-center text-sm text-muted-foreground">{message}</div>
  );
}

export function ModernTablePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border/70 px-4 py-3 text-sm text-muted-foreground">
      <p>
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
