'use client';

import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SortOption } from '@/lib/table-sort';

interface DataTableSortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SortOption[];
  className?: string;
}

export function DataTableSortSelect({
  value,
  onValueChange,
  options,
  className,
}: DataTableSortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={
          className ??
          'h-9 w-[12.5rem] shrink-0 gap-2 border-border/80 shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:border-border/80 focus-visible:ring-0 data-[state=open]:border-border/80 data-[state=open]:ring-0'
        }
      >
        <ArrowUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
