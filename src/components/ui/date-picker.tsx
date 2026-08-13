'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  clearable?: boolean;
}

export function DatePicker({
  onChange,
  value,
  onBlur,
  label,
  error,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  id,
  clearable = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      ) : null}
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) onBlur?.();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive',
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            <span className="truncate">
              {value ? format(value, 'PPP') : placeholder}
            </span>
            {clearable && value && !disabled ? (
              <span
                role="button"
                tabIndex={-1}
                className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange?.(undefined);
                }}
                aria-label="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              if (date) setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
