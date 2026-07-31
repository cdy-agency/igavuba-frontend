'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export type SortOption =
  | 'trending'
  | 'newest'
  | 'oldest'
  | 'price_low'
  | 'price_high';

interface CourseSearchSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults?: number;
}

export function CourseSearchSort({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
}: CourseSearchSortProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'trending', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search courses by title, description..."
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            className="pl-10 pr-10"
          />
          {localSearch ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {totalResults !== undefined ? (
        <div className="text-sm text-muted-foreground">
          {totalResults === 0 ? (
            <span>No courses found</span>
          ) : (
            <span>
              Found{' '}
              <span className="font-medium text-foreground">{totalResults}</span>{' '}
              {totalResults === 1 ? 'course' : 'courses'}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
