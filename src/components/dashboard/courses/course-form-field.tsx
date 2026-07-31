'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const courseFormInputClass =
  'h-9 border-border/80 bg-background text-[13px] shadow-none placeholder:text-muted-foreground/55';

export const courseFormSelectTriggerClass =
  'h-9 border-border/80 bg-background text-[13px] shadow-none';

interface CourseFormFieldProps {
  icon?: LucideIcon;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function CourseFormField({
  icon: Icon,
  label,
  required,
  optional,
  hint,
  error,
  children,
  className,
}: CourseFormFieldProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-start gap-2.5">
        {Icon ? (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <label className="block text-[13px] font-semibold leading-none tracking-tight text-foreground">
            {label}
            {required ? <span className="ml-0.5 font-bold text-destructive">*</span> : null}
            {optional ? (
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground/75">
                (optional)
              </span>
            ) : null}
          </label>
          {children}
        </div>
      </div>
      {hint ? (
        <p className={cn('text-[11px] leading-relaxed text-muted-foreground/80', Icon && 'pl-9')}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={cn('text-[11px] font-medium text-destructive', Icon && 'pl-9')}>{error}</p>
      ) : null}
    </div>
  );
}
