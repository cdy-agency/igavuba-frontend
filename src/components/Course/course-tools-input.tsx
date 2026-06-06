'use client';

import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hasDuplicateTagName, normalizeTagName } from '@/lib/course-tags';
import type { CourseTool } from '@/types/course-tool';

export type CourseToolInputItem = Pick<CourseTool, 'id' | 'name'> | { name: string };

interface CourseToolsInputProps {
  items: CourseToolInputItem[];
  onAdd: (name: string) => void | Promise<void>;
  onRemove: (item: CourseToolInputItem, index: number) => void | Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  isAdding?: boolean;
  removingKey?: string | null;
}

function getItemKey(item: CourseToolInputItem, index: number): string {
  return 'id' in item && item.id ? item.id : `pending-${index}-${item.name}`;
}

export function CourseToolsInput({
  items,
  onAdd,
  onRemove,
  disabled = false,
  isLoading = false,
  error = null,
  isAdding = false,
  removingKey = null,
}: CourseToolsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAdd = async () => {
    const name = normalizeTagName(inputValue);
    if (!name) {
      setInputError('Enter a tool name.');
      return;
    }

    if (hasDuplicateTagName(items, name)) {
      setInputError('This tool already exists.');
      return;
    }

    setInputError(null);
    await onAdd(name);
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleAdd();
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-semibold">Tools You&apos;ll Use</Label>
        <p className="text-sm text-muted-foreground">
          Add the tools and technologies used in this course.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tools...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No tools added yet. Add your first tool below.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const key = getItemKey(item, index);
            const isRemoving = removingKey === key;

            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-normal"
              >
                <span>{item.name}</span>
                <button
                  type="button"
                  className="rounded-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  onClick={() => void onRemove(item, index)}
                  disabled={isDisabled || isRemoving}
                  aria-label={`Remove ${item.name}`}
                >
                  {isRemoving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-1">
          <Input
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (inputError) setInputError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Docker"
            disabled={isDisabled || isAdding}
            maxLength={100}
          />
          {inputError ? (
            <p className="text-sm text-destructive">{inputError}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleAdd()}
          disabled={isDisabled || isAdding}
          className="shrink-0"
        >
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Tool
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
