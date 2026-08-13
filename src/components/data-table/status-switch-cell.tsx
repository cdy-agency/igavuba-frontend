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
  showLabel?: boolean;
}

export function StatusSwitchCell({
  checked,
  disabled,
  isPending,
  onCheckedChange,
  label = 'Active',
  className,
  size = 'sm',
  showLabel = true,
}: StatusSwitchCellProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden />
      ) : null}
      <Switch
        size={size}
        checked={checked}
        disabled={disabled || isPending}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
      {showLabel ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
