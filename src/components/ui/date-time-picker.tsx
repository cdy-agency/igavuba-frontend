'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/** Format a Date as `yyyy-MM-ddTHH:mm` for local datetime fields. */
export function toDatetimeLocalValue(value?: string | Date | null) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse `yyyy-MM-ddTHH:mm` (or ISO) into a Date. */
export function parseDatetimeLocalValue(value?: string | null): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

export interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  clearable?: boolean;
}

export function DateTimePicker({
  value = '',
  onChange,
  onBlur,
  disabled = false,
  placeholder = 'Pick date & time',
  className,
  id,
  clearable = true,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDatetimeLocalValue(value);

  const commit = (next: Date | undefined) => {
    onChange?.(next ? toDatetimeLocalValue(next) : '');
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      commit(undefined);
      return;
    }

    const next = new Date(day);
    if (selected) {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else {
      const now = new Date();
      next.setHours(now.getHours(), now.getMinutes(), 0, 0);
    }
    commit(next);
  };

  const handleTimeChange = (timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

    const base = selected ? new Date(selected) : new Date();
    base.setHours(hours, minutes, 0, 0);
    commit(base);
  };

  const timeValue = selected
    ? `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`
    : '';

  return (
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
            'h-10 w-full justify-start gap-2 px-3 text-left font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
          <span className="truncate">
            {selected ? format(selected, 'MMM d, yyyy · HH:mm') : placeholder}
          </span>
          {clearable && selected && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                commit(undefined);
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
          selected={selected}
          onSelect={handleDaySelect}
          initialFocus
        />
        <div className="border-t border-border/60 px-3 py-3">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Time
          </label>
          <Input
            type="time"
            value={timeValue}
            disabled={disabled}
            onChange={(event) => handleTimeChange(event.target.value)}
            className="h-9"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
