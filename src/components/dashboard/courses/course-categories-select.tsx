'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCategoriesList } from '@/hooks/use-categories';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface CourseCategoriesSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function CourseCategoriesSelect({
  value,
  onChange,
  disabled = false,
}: CourseCategoriesSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: categories = [], isPending } = useCategoriesList();

  const selectedCategories = useMemo(
    () => categories.filter((category: Category) => value.includes(category.id)),
    [categories, value],
  );

  const toggleCategory = (categoryId: string) => {
    if (value.includes(categoryId)) {
      onChange(value.filter((id) => id !== categoryId));
      return;
    }
    onChange([...value, categoryId]);
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isPending}
            className="h-10 w-full justify-between text-[13px] font-normal"
          >
            {selectedCategories.length > 0
              ? `${selectedCategories.length} categor${
                  selectedCategories.length === 1 ? 'y' : 'ies'
                } selected`
              : 'Search and select categories'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category: Category) => {
                  const isSelected = value.includes(category.id);
                  return (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => toggleCategory(category.id)}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="flex-1">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.publishedCourseCount}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category: Category) => (
            <Badge key={category.id} variant="secondary" className="gap-1 pr-1">
              {category.name}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-background/60"
                onClick={() => toggleCategory(category.id)}
                disabled={disabled}
                aria-label={`Remove ${category.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
