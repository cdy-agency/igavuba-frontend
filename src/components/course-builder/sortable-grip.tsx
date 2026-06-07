'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableGripProps {
  className?: string;
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
}

export function SortableGrip({ className, listeners, attributes }: SortableGripProps) {
  return (
    <button
      type="button"
      className={cn(
        'touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}
