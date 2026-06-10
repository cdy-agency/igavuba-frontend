'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategoriesList } from '@/hooks/use-categories';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { Category } from '@/types/category';
import { courseFormSelectTriggerClass } from '@/components/dashboard/courses/course-form-field';

interface CourseCategorySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function CourseCategorySelect({
  value,
  onChange,
  disabled = false,
}: CourseCategorySelectProps) {
  const authReady = useAuthReady();
  const { data: categories = [], isPending } = useCategoriesList(authReady);

  const selectedId = value[0] ?? 'none';

  const handleChange = (nextValue: string) => {
    if (nextValue === 'none') {
      onChange([]);
      return;
    }
    onChange([nextValue]);
  };

  return (
    <Select
      value={selectedId}
      onValueChange={handleChange}
      disabled={disabled || isPending}
    >
      <SelectTrigger className={courseFormSelectTriggerClass}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No category</SelectItem>
        {categories.map((category: Category) => (
          <SelectItem key={category.id} value={category.id}>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>📁</span>
              {category.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
