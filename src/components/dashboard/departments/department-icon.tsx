'use client';

import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function getDepartmentInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function DepartmentIcon({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const initials = getDepartmentInitials(name);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/8 text-primary',
        size === 'sm' ? 'h-9 w-9 text-xs font-semibold' : 'h-11 w-11 text-sm font-semibold',
        className,
      )}
    >
      {initials || <Building2 className="h-4 w-4" />}
    </div>
  );
}
