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
}

export function StatusSwitchCell({
  checked,
  disabled,
  isPending,
  onCheckedChange,
  label = 'Active',
  className,
}: StatusSwitchCellProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
      ) : null}
      <span className="sr-only">{label}</span>
      <Switch
        checked={checked}
        disabled={disabled || isPending}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}
