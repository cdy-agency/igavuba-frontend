'use client';

import { useState } from 'react';
import {
  CourseSkillsInput,
  type CourseSkillInputItem,
} from '@/components/Course/course-skills-input';
import {
  useCourseSkills,
  useCreateCourseSkill,
  useDeleteCourseSkill,
} from '@/hooks/use-course-skills';
import type { CourseSkill } from '@/types/course-skill';
import { getApiErrorMessage } from '@/lib/auth';

interface CourseSkillsManagerProps {
  mode: 'create' | 'edit';
  courseId?: string;
  initialSkills?: CourseSkill[];
  pendingSkills: string[];
  onPendingSkillsChange: (skills: string[]) => void;
  disabled?: boolean;
}

function getItemKey(item: CourseSkillInputItem, index: number): string {
  return 'id' in item && item.id ? item.id : `pending-${index}-${item.name}`;
}

export function CourseSkillsManager({
  mode,
  courseId,
  initialSkills = [],
  pendingSkills,
  onPendingSkillsChange,
  disabled = false,
}: CourseSkillsManagerProps) {
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const {
    data: skills = [],
    isLoading,
    isError,
    error,
  } = useCourseSkills(courseId ?? '', {
    enabled: mode === 'edit' && Boolean(courseId),
    initialData: initialSkills,
  });

  const createSkillMutation = useCreateCourseSkill(courseId ?? '');
  const deleteSkillMutation = useDeleteCourseSkill(courseId ?? '');

  if (mode === 'create') {
    const items: CourseSkillInputItem[] = pendingSkills.map((name) => ({ name }));

    return (
      <CourseSkillsInput
        items={items}
        disabled={disabled}
        isAdding={false}
        onAdd={(name) => {
          onPendingSkillsChange([...pendingSkills, name]);
        }}
        onRemove={(_item, index) => {
          onPendingSkillsChange(pendingSkills.filter((_, i) => i !== index));
        }}
      />
    );
  }

  const handleAdd = async (name: string) => {
    if (!courseId) return;
    await createSkillMutation.mutateAsync(name);
  };

  const handleRemove = async (item: CourseSkillInputItem, index: number) => {
    if (!courseId || !('id' in item) || !item.id) return;

    const key = getItemKey(item, index);
    setRemovingKey(key);
    try {
      await deleteSkillMutation.mutateAsync(item.id);
    } finally {
      setRemovingKey(null);
    }
  };

  return (
    <CourseSkillsInput
      items={skills}
      disabled={disabled || createSkillMutation.isPending || deleteSkillMutation.isPending}
      isLoading={isLoading}
      isAdding={createSkillMutation.isPending}
      removingKey={removingKey}
      error={
        isError ? getApiErrorMessage(error, 'Failed to load skills.') : null
      }
      onAdd={handleAdd}
      onRemove={handleRemove}
    />
  );
}
