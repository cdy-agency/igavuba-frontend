'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReviewSort } from '@/types/review.types';

export function ReviewFilters({
  sort,
  search,
  onSortChange,
  onSearchChange,
}: {
  sort: ReviewSort;
  search: string;
  onSortChange: (sort: ReviewSort) => void;
  onSearchChange: (search: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search reviews"
          className="h-11 rounded-none border-border bg-card pl-10 shadow-none focus-visible:ring-ring"
        />
      </div>
      <Select value={sort} onValueChange={(value) => onSortChange(value as ReviewSort)}>
        <SelectTrigger className="h-11 w-full rounded-none border-border sm:w-52">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Most recent</SelectItem>
          <SelectItem value="highest">Highest rated</SelectItem>
          <SelectItem value="lowest">Lowest rated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
