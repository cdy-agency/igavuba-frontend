'use client';

import { useState } from 'react';
import {
  CourseToolsInput,
  type CourseToolInputItem,
} from '@/components/Course/course-tools-input';
import {
  useCourseTools,
  useCreateCourseTool,
  useDeleteCourseTool,
} from '@/hooks/use-course-tools';
import type { CourseTool } from '@/types/course-tool';
import { getApiErrorMessage } from '@/lib/auth';

interface CourseToolsManagerProps {
  mode: 'create' | 'edit';
  courseId?: string;
  initialTools?: CourseTool[];
  pendingTools: string[];
  onPendingToolsChange: (tools: string[]) => void;
  disabled?: boolean;
}

function getItemKey(item: CourseToolInputItem, index: number): string {
  return 'id' in item && item.id ? item.id : `pending-${index}-${item.name}`;
}

export function CourseToolsManager({
  mode,
  courseId,
  initialTools = [],
  pendingTools,
  onPendingToolsChange,
  disabled = false,
}: CourseToolsManagerProps) {
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const {
    data: tools = [],
    isLoading,
    isError,
    error,
  } = useCourseTools(courseId ?? '', {
    enabled: mode === 'edit' && Boolean(courseId),
    initialData: initialTools,
  });

  const createToolMutation = useCreateCourseTool(courseId ?? '');
  const deleteToolMutation = useDeleteCourseTool(courseId ?? '');

  if (mode === 'create') {
    const items: CourseToolInputItem[] = pendingTools.map((name) => ({ name }));

    return (
      <CourseToolsInput
        items={items}
        disabled={disabled}
        isAdding={false}
        onAdd={(name) => {
          onPendingToolsChange([...pendingTools, name]);
        }}
        onRemove={(_item, index) => {
          onPendingToolsChange(pendingTools.filter((_, i) => i !== index));
        }}
      />
    );
  }

  const handleAdd = async (name: string) => {
    if (!courseId) return;
    await createToolMutation.mutateAsync(name);
  };

  const handleRemove = async (item: CourseToolInputItem, index: number) => {
    if (!courseId || !('id' in item) || !item.id) return;

    const key = getItemKey(item, index);
    setRemovingKey(key);
    try {
      await deleteToolMutation.mutateAsync(item.id);
    } finally {
      setRemovingKey(null);
    }
  };

  return (
    <CourseToolsInput
      items={tools}
      disabled={disabled || createToolMutation.isPending || deleteToolMutation.isPending}
      isLoading={isLoading}
      isAdding={createToolMutation.isPending}
      removingKey={removingKey}
      error={isError ? getApiErrorMessage(error, 'Failed to load tools.') : null}
      onAdd={handleAdd}
      onRemove={handleRemove}
    />
  );
}
