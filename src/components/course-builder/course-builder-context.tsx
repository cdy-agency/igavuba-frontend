'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ContentType } from '@/types/content';

export type LessonCreateType = 'text' | 'video' | 'document';

interface CourseBuilderContextValue {
  selectedModuleId: string | null;
  setSelectedModuleId: (moduleId: string | null) => void;
  selectedContentId: string | null;
  setSelectedContentId: (contentId: string | null) => void;
  creatingLessonType: LessonCreateType | null;
  startCreatingLesson: (type: LessonCreateType) => void;
  cancelCreatingLesson: () => void;
}

const CourseBuilderContext = createContext<CourseBuilderContextValue | null>(null);

export function CourseBuilderProvider({ children }: { children: ReactNode }) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [creatingLessonType, setCreatingLessonType] = useState<LessonCreateType | null>(null);

  const value = useMemo(
    () => ({
      selectedModuleId,
      setSelectedModuleId,
      selectedContentId,
      setSelectedContentId,
      creatingLessonType,
      startCreatingLesson: (type: LessonCreateType) => {
        setCreatingLessonType(type);
        setSelectedContentId(null);
      },
      cancelCreatingLesson: () => setCreatingLessonType(null),
    }),
    [selectedModuleId, selectedContentId, creatingLessonType],
  );

  return (
    <CourseBuilderContext.Provider value={value}>{children}</CourseBuilderContext.Provider>
  );
}

export function useCourseBuilder() {
  const context = useContext(CourseBuilderContext);
  if (!context) {
    throw new Error('useCourseBuilder must be used within CourseBuilderProvider');
  }
  return context;
}

export function lessonTypeLabel(type: ContentType | LessonCreateType): string {
  switch (type) {
    case 'TEXT':
    case 'text':
      return 'Text';
    case 'VIDEO':
    case 'video':
      return 'Video';
    case 'DOCUMENT':
    case 'document':
      return 'Document';
    default:
      return 'Lesson';
  }
}
