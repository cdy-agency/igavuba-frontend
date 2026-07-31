'use client';

import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface StatusSwitchCellProps {
  checked: boolean;
  disabled?: boolean;
  isPending?: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  size?: 'default' | 'sm' | 'xs' | 'xxs';
}

export function StatusSwitchCell({
  checked,
  disabled,
  isPending,
  onCheckedChange,
  label = 'Active',
  className,
  size = 'xxs',
}: StatusSwitchCellProps) {
  return (
    <div className={cn('flex items-center justify-end gap-1.5', className)}>
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" aria-hidden />
      ) : null}
      <span className="sr-only">{label}</span>
      <Switch
        size={size}
        checked={checked}
        disabled={disabled || isPending}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}
