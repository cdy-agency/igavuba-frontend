'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  numberOfMonths?: number;
  align?: 'start' | 'center' | 'end';
}

export function formatDateRangeLabel(range?: DateRange, placeholder = 'Pick a date range') {
  if (range?.from && range?.to) {
    return `${format(range.from, 'MMM d, yyyy')} → ${format(range.to, 'MMM d, yyyy')}`;
  }

  if (range?.from) {
    return `${format(range.from, 'MMM d, yyyy')} → …`;
  }

  return placeholder;
}

export function dateRangeToIsoStrings(range?: DateRange) {
  return {
    start: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
    end: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
  };
}

export function DateRangePicker({
  value,
  onChange,
  label = 'Date range',
  placeholder = 'Pick a date range',
  className,
  numberOfMonths = 2,
  align = 'start',
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-auto min-h-9 justify-start gap-2 rounded-[11px] border-[#e6edf1] bg-white px-3 py-1.5 text-left font-normal shadow-sm hover:bg-white',
            className,
          )}
        >
          {label ? (
            <span className="shrink-0 text-[11.5px] font-semibold text-[#8aa0ad]">{label}</span>
          ) : null}
          <span
            className={cn(
              'text-[12.5px] font-semibold text-[#475a66]',
              !value?.from && 'text-[#8aa0ad]',
            )}
          >
            {formatDateRangeLabel(value, placeholder)}
          </span>
          <CalendarIcon className="ml-1 h-3.5 w-3.5 shrink-0 text-[#8aa0ad]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={(range) => {
            onChange?.(range);
            if (range?.from && range?.to) {
              setOpen(false);
            }
          }}
          numberOfMonths={numberOfMonths}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
